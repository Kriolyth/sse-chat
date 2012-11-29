/*
	SSE Initiator
	
	Handles connection request to SSE socket (the GET query)
*/

var querystring = require( 'querystring' );
var Filter = require( './filter.js' ).Filter;
var Sessions = require( './session.js' ).Sessions;

function Initiator( router ) {
		// private scope
		var requestRouter = router;
		
		function onConnect( response, request ) {
			var qs = querystring.parse( body );
			if ( !qs['id'] ) {
				return connError( response, request, 'Missing ID' );
			}
			var sess = Sessions.find( { user: qs['id'], halfopen: 1 } );
			if ( !sess || (sess.socket != null) ) {
				// think carefully about session hijacking
				// "halfopen" is pretty decent, but still not safe enough
				return unauth( response, request );
			}
			
			// write OK headers and continue with connection
			
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
				headers: request.headers,
				detail: detail }
			response.write( JSON.stringify( dump, undefined, '\t' ) );
			response.end();
			
			return true;
		}
		
		// on creation actions
		router.addHandler( { method: 'GET', url: { match: '/server?' } }, onConnect );
		
		// public interface
		return {
			listen: function( port, ip ) {
				httpServer.listen( port, ip )
			},
			
			// All requests are combined, parsed and sent further
			setRequestRouter: function( router ) {
				requestRouter = router
			}
		}

	};

	
exports.Listener = Listener;