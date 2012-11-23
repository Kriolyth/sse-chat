/*
	HTTP Listener 
	
	Receives messages and delegates actions accordingly.
	Single instance.
*/

Listener = ( function() {
		// private scope
		var requestRouter;
		
		function onMessage( response, request, body ) {
		}
		function unsupported( response ) {
		}

		// HTTP server
		var http = require('http');
		http.createServer(function (request, response) {
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
					unsupported( response );
			}
			
		
		// public interface
		return {
			function listen( port, ip ) {
				// httpServer.listen( port, ip )
			}
			
			// All requests are combined, parsed and sent further
			function setRequestRouter( router ) {
				// requestRouter = router
			}
		}

	} )();
