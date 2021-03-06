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
				// Javascritp objects are all references AND sessions are not stored 
				// on a persistent memory device, so no need to update here
				//Sessions.update( sess );
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
			sess.attach( response );

			if ( welcomeProc )
				welcomeProc( sess );
			else {
				// Probably, setup a new channel for the new user
				// or maybe do nothing and let client side
				// display a help message or a list of available
				// public channels
			}
			
			
			return true;
			
		}
		function unauth( response, request ) {
			response.writeHead( 401, "Not authorized", {
					'Content-Type': 'text/plain',
				} );
			var dump = { status: 401,
				httpVersion: request.httpVersion,
				method: request.method,
				url: request.url }
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