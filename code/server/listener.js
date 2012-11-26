/*
	HTTP Listener 
	
	Receives messages and delegates actions accordingly.
*/

function Listener( router ) {
		// private scope
		var requestRouter = router;
		
		function onMessage( response, request, body ) {
			if ( requestRouter )
				requestRouter.route( response, request, body );
		}
		function unsupported( response, request ) {
			response.writeHead( 405, "Method Not Allowed", {
					'Content-Type': 'text/plain',
					'Allow': 'GET, POST'
				} );
			response.write( JSON.stringify( request ) );
			response.end();
		}

		// HTTP server
		var http = require('http');
		var httpServer = http.createServer( function (request, response) {
			switch( request.method) {
				case 'POST':
					//processPost( request, response );
					var gatherer = require( 'gatherer' );
					gatherer.collect( request, function(body){ 
						onMessage( response, request, body ); } );
					break;
				case 'GET':
					onMessage( response, request );
					break;
				default:
					// return unsupported and close response
					unsupported( response, request );
			}
			} );
			
		
		// public interface
		return {
			function listen( port, ip ) {
				httpServer.listen( port, ip )
			}
			
			// All requests are combined, parsed and sent further
			function setRequestRouter( router ) {
				requestRouter = router
			}
		}

	};

	
exports.Listener = Listener;