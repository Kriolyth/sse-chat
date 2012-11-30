/*
	SSE Initiator
	
	Handles connection request to SSE socket (the GET query)
*/

var url = require( 'url' );
var Filter = require( './filter.js' ).Filter;
var Sessions = require( './session.js' ).Sessions;

function Initiator( router ) {
		// private scope
		var requestRouter = router;
		var welcomeProc = null;
		
		function onConnect( response, request ) {
			var qs = url.parse( request.url, true ).query;
			if ( !qs['id'] ) {
				return connError( response, request, qs );
			}
			var sess = Sessions.find( { id: qs.id, openState: 1 } );
			if ( !sess || (sess.socket != null) ) {
				// think carefully about session hijacking
				// "halfopen" is pretty decent, but still not safe enough
				return unauth( response, request );
			}
			
			var lastEventId = request.headers['Last-Event-Id'] || qs['Last-Event-ID'];
			if ( lastEventId ) {
				sess.lastEventId = lastEventId;
				Sessions.update( sess );
			}
			
			// write OK headers and continue with connection
			response.writeHead( 200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				// Screw the CORS for now
				//'Access-Control-Allow-Credentials': 'true',
				//'Access-Control-Allow-Origin': 'http://' + request.headers.host
			} );
			response.write( ': Welcome aboard!\nretry: 15000\n\n' );
			
			/* 
				This is a sample how the code could go next
				
			Dispatcher.add( sess );
			
			if ( !welcomeProc ) {
				var chans = Channels.find( { user: sess.user } );
				if ( chans.length == 0 ) {
					// no channels, open a personal channel for user
					Channels.add( { host: sess, public: false } );
					Queue.push( SysMsg.help( 'chan' ), sess );
				} else {
					// send a list of all channels the user has attended
					Channels.sendList( chans, sess );
					History.loadHistory( sess );
				}
			} else {
				welcomeProc( sess );
			}			
			
			*/
			
			return true;
			
		}
		function unauth( response, request ) {
			response.writeHead( 403, "Not authorized", {
					'Content-Type': 'text/plain',
				} );
			var dump = { status: 403,
				httpVersion: request.httpVersion,
				method: request.method,
				url: request.url,
				headers: request.headers }
			response.write( JSON.stringify( dump, undefined, '\t' ) );
			response.end();
			
			return true;
		}
		
		function connError( response, request, detail ) {
			response.writeHead( 404, "Not Found", {
					'Content-Type': 'text/plain',
				} );
			var dump = { status: 404,
				httpVersion: request.httpVersion,
				method: request.method,
				url: request.url,
				detail: detail }
			response.write( JSON.stringify( dump, undefined, '\t' ) );
			response.end();
			
			return true;
		}
		
		// on creation actions
		router.addHandler( { method: 'GET', url: { match: '/session?' } }, onConnect );
		
		// public interface
		return {
			setWelcomeProc: function( proc ) {
				welcomeProc = proc;
			}
		}

	};

	
exports.Initiator = Initiator;