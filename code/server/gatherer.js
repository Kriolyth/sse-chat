/*
	HTTP Request Gatherer 
	
	Retrieves request body
*/

Gatherer = {
		var body;
		
		function collect( request, dataEnd, limit = 65536 ) {
			request.addListener('data', dataCollect );
			request.once('end', (function(end){ return dataReceived(request, end); })(dataEnd) );
		}
		
		function dataCollect(chunk) {
			// append the current chunk of data to the fullBody variable
			body += chunk.toString();
		};
		
		function dataReceived( request, end ) {
			return function() {
				request.removeListener( 'data', dataCollect );
				end( body );
			}
		}
}