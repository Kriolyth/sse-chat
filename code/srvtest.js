var util = require('util');
var querystring = require( 'querystring' );

var PORT = 8002;

util.puts('Starting server at http://localhost:' + PORT);

process.on('uncaughtException', function (e) {
  try {
    util.puts('Caught exception: ' + e + ' ' + (typeof(e) === 'object' ? e.stack : ''));
  } catch (e0) {}
});

var router = require('./server/router.js').Router();
var listener = require('./server/listener.js').Listener( router );
var auth = require('./server/auth.js').AuthProcessor( router );
var initiator = require('./server/initiator.js').Initiator( router );
var channels = require('./server/channeldb.js').ChannelsDB;
var msgRouter = require('./server/msgrouter.js').MessageRouter( router );
var users = require('./server/userdb.js').UserDB;
var sessions = require('./server/session.js').Sessions;
var actions = require('./server/action.js');
var helpmsg = require('./server/helpmsg.js').HelpMsg;

function onGet( response, request ) {
	util.puts( 'GET: ' + request.url );
	
	response.writeHead( 200, "OK", {
			'Content-Type': 'text/plain',
		} );
	var dump = { status: 200,
		httpVersion: request.httpVersion,
		method: request.method,
		url: request.url,
		headers: request.headers }
	response.write( JSON.stringify( dump, undefined, '\t' ) );
				
	response.end();
	return true;
}
function onPost( response, request, body ) {
	util.puts( 'POST: ' + request.url );
	
	response.writeHead( 200, "OK", {
			'Content-Type': 'text/html',
		} );
	var dump = { status: 200,
		httpVersion: request.httpVersion,
		method: request.method,
		url: request.url,
		headers: request.headers,
		body: body }
		
	var html = '<!DOCTYPE html><body><form method="post" action="/auth"><fieldset><input name="name" value="User1"/>' +
		'<input name="id" value="1001"/><input name="pin" value="1234"/>' +
		'<input type="submit" value="Submit"/></fieldset></form>';
		
	html += '<pre>' + JSON.stringify( dump, undefined, '\t' ) + '</pre></body></html>';
	response.write( html );
	
	response.end();
	return true;
}

function showForm( response, request ) {
	util.puts( 'GET: ' + request.url );
	
	response.writeHead( 200, "OK", {
			'Content-Type': 'text/html',
		} );
	var html = '<!DOCTYPE html><body><form method="post" action="/auth"><fieldset><input name="name" value="User1"/>' +
		'<input name="id" value="1001"/><input name="pin" value="1234"/>' +
		'<input type="submit" value="Submit"/></fieldset></form>';
		
	html += '<form method="get" action="/session"><fieldset><input name="id" value="1234"/>' +
		'<input type="submit" value="Submit"/></fieldset></form>';
		
	html += '</body>';
	response.write( html );
				
	response.end();
	return true;
}

router.addHandler( { method: 'GET', url: '/' }, onGet );
router.addHandler( { method: 'GET', url: { regex: '^/help' } }, onGet );
router.addHandler( { method: 'GET', url: { match: '/post' } }, showForm );
router.addHandler( { method: 'POST', url: { match: '/post' } }, onPost );

var defaultChan = channels.add();
defaultChan.name = 'Public';

function welcomeProc( session ) {
	util.puts( 'Welcome to session ' + session.id );
	session.setNotifyClose( goodbyeProc );
	var user = users.get( session.user );
	var userchans = channels.findUserChannels( user );
	if ( userchans.length > 0 ) {
		util.puts( 'Loading channels for user ' + user.name );
		actions.listChannels( session );
		var userSessions = sessions.findUserSessions( [ user.id ] );
		var userSessCount = userSessions.length;
		userchans.forEach( function _UserChansEnter(chan){
			if ( userSessCount == 1 ) {
				// do not notify channel on second session
				actions.enterChannel( user, chan );
			}
			// TODO: loadHistory
		} );
	} else {
		// no channels for user 
		util.puts( 'Joining default channel for user ' + user.name + ', pin ' + user.pin );
		actions.joinChannel( user, defaultChan );
	}
}

function goodbyeProc( session ) {
	util.puts( 'Goodbye to session ' + session.id );
	var user = users.get( session.user );
	var userSessions = sessions.findUserSessions( [ user.id ] );
	var userSessCount = userSessions.length;
	if ( userSessCount == 0 ) {
		// user left
		util.puts( 'User ' + user.name + ' has left' );
		var userchans = channels.findUserChannels( user );
		userchans.forEach( function _UserChansExit(chan){
			actions.exitChannel( user, chan );
		} );
	}
}

initiator.setWelcomeProc( welcomeProc );

auth.setHalfopenTimeout( 15000 );

listener.listen( PORT, '127.0.0.1' );