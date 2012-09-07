var PORT = 8002;

var util = require('util');
var http = require('http');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var querystring = require('querystring');

util.puts('Starting server at http://localhost:' + PORT);

process.on('uncaughtException', function (e) {
  try {
    util.puts('Caught exception: ' + e + ' ' + (typeof(e) === 'object' ? e.stack : ''));
  } catch (e0) {}
});

var emitter = new EventEmitter();
var history = [];
var servicemsg = [];
var heartbeatTimeout = 9000;
var firstId = Number(new Date());

var users = [];

var SYSMSG = { userConnected: -1, userDisconnected: -2 };

setInterval(function () {
  emitter.emit('message');
}, heartbeatTimeout / 2);

function eventStream(request, response, uid) {
	var post = '',
		lastEventId;

	function sendMessages() {
		lastEventId = Math.max(lastEventId, firstId);
		while (lastEventId - firstId < history.length) {
			var msg = history[lastEventId - firstId];
			if ( users[msg.uid] != undefined ) {
				var data = { 
					msgType : msg.msgType,
					owner   : msg.uid == uid ? 'self' : ( msg.uid == -1 ? 'system' : 'other' ),
					author  : users[msg.uid].name,
					ts      : msg.ts,
					msg     : msg.msg
					}
				response.write('id: ' + (lastEventId + 1) + '\n' + 'data: ' + JSON.stringify(data) + '\n\n');
			}
			lastEventId += 1;
		}
		
		// Send service messages, if any
		for ( var i in servicemsg ) {
			var msg = servicemsg[i];
			response.write('event: ' + msg.event + '\n' );
			response.write('data: ' + JSON.stringify(msg) + '\n\n');
		}
		servicemsg = [];
		
		response.write(':\n');
	}

  function onRequestEnd() {
    post = querystring.parse(post);// failure ???
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
       //'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': 'http://' + request.headers.host
    });
    lastEventId = +request.headers['last-event-id'] || +post['Last-Event-ID'] || 0;

    // 2 kb comment message for XDomainRequest (IE8, IE9)
    //response.write(':' + Array(2049).join(' ') + '\n');
    response.write('retry: 1000\n');
    response.write('heartbeatTimeout: ' + heartbeatTimeout + '\n');

    emitter.addListener('message', sendMessages);
    emitter.setMaxListeners(0);

    sendMessages();
  }

  response.socket.on('close', function () {
	//console.log( (new Date()).toISOString() + ': onSocketClose' );
	
    emitter.removeListener('message', sendMessages);
    request.removeListener('end', onRequestEnd);
    response.end();
	
	if ( users[ String(uid) ] != undefined ) {
		users[ String(uid) ].activeCount--;
		if ( 0 == users[ String(uid) ].activeCount )
			postSysMsg( 'userDisconnected', users[ String(uid) ].name );
	} else {
		console.log( 'Socket close on undefined user ' + uid );
	}
  });

  request.addListener('data', function (data) {
    if (post.length < 16384) {
      post += data;
    }
  });

  request.addListener('end', onRequestEnd);
  response.socket.setTimeout(0); // see http://contourline.wordpress.com/2011/03/30/preventing-server-timeout-in-node-js/
}

function postSysMsg( msgType, text )
{
	var data = {
		msgType : SYSMSG[ msgType ],
		uid: -1,
		ts: (new Date()).getTime(),
		msg: text
	};
	
	history.push( data );
	emitter.emit( 'message' );
}

users[ '-1' ] = { name: 'System', activeCount: 1 };

http.createServer(function (request, response) {
	var url = request.url,
		query = require('url').parse(url, true).query,
		time,
		data;

	if ( /^\/auth\?/.test(url) && query.name ) {
		var uid = parseInt( query.id );
		var success = false;
		var qname = query.name.trim();
		console.log( 'Auth request: id=' + uid + ', name=' + qname );
		if ( 0 >= uid || users[ String(uid) ] == undefined ) {
			// search for an old user with such name
			var found;
			for ( var i in users ) {
				if ( users[i].name == qname ) {
					found = i;
				}
			}
			
			if ( found == undefined ) {			
				uid = Math.floor( Math.random() * 1677214 ) + 2;
				users[ String(uid) ] = { name: qname, activeCount: 1 };
				console.log( 'New UID ' + uid );
				success = true;
			} else if ( 0 == users[found].activeCount ) {
				users[ found ].activeCount++;
				console.log( 'UID takeover ' + uid );
				success = true;
			} else {
				console.log( 'UID takeover failed, active user ' + found );
				success = false;
			}
		}
		else if ( qname == users[ String(uid) ].name ) {
			console.log( 'Existing user with UID ' + uid );
			users[ String(uid) ].activeCount++;
			success = true;
		}
		else {
			console.log( 'Failed logon with UID ' + uid );
			success = false;
		}
		
		if ( success ) {
			response.writeHead( 200, {
				'Content-Type': 'text/plain'
				}
			);
			response.end( String(uid) );
			if ( users[ String(uid) ].activeCount == 1 )
				postSysMsg( 'userConnected', users[ String(uid) ].name );
		} else {
			response.writeHead( 201, {
				'Content-Type': 'text/plain'
				}
			);
			response.end( 'Auth failed' );
		}
		return;
	}
	else if ( /^\/\?/.test(url) && query.message && query.id ) {
		time = new Date();
		var msgType = 1;
		if ( query.msgType && query.msgType > 0 )
			msgType = query.msgType;
		data = {
			msgType: msgType,
			uid: query.id,
			ts: time.getTime(), 
			msg: query.message 
		};
		response.writeHead( 200, {
			'Content-Type': 'text/plain'
			}
		);
		response.end(String(history.push(data)));
		emitter.emit('message');
		return;
	}
	console.log((new Date()).toISOString() + ': ' + url);

	if ( /^\/\?id=\d+/.test(url) ) {
		var id = parseInt( /\?id=(\d+)/.exec( url )[1] );
		console.log( 'new Stream: ' + id );
		if ( 0 != id )
			eventStream(request, response, id);
	}
	
}).listen(PORT, '127.0.0.1');