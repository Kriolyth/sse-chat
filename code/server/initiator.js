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
		var defaultChannel;
		
		function onConnect( response, request ) {
			var qs = url.parse( request.url, true ).query;
			if ( !qs['id'] ) {
				return connError( response, request, qs );
			}
			var sess = Sessions.find( { id: qs.id, halfopen: 1 } );
			if ( !sess || (sess.socket != null) ) {
				// think carefully about session hijacking
				// "halfopen" is pretty decent, but still not safe enough
				return unauth( response, request );
			}
			
			// write OK headers and continue with connection
			sess.attach( response );
			response.writeHead( 200, "Ok", {
					'Content-Type': 'text/plain',
				} );
			var dump = { status: 200,
				session: sess.id }
			response.write( JSON.stringify( dump, undefined, '\t' ) );
			response.end();
			
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
			setDefaultChannel: function( channel ) {
				defaultChannel = channel;
			}
		}

	};

	
exports.Initiator = Initiator;