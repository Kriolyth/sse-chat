/*
	HTTP Request Gatherer 
	
	Retrieves request body
*/

function Gatherer() {
		var body;
		var maxLength = 0;
		
		function dataCollect(chunk) {
			// append the current chunk of data to the fullBody variable
			if ( !maxLength || body.length <= maxLength ) 
				body += chunk.toString();
		};
		
		function dataReceived( request, end ) {
			return function() {
				request.removeListener( 'data', dataCollect );
				end( body );
			}
		}
		
		return {
			collect: function( request, dataEnd, limit ) {
				if ( limit ) maxLength = limit;
				body = '';
				request.addListener('data', dataCollect );
				request.once('end', (function(end){ return dataReceived(request, end); })(dataEnd) );
			}
		}
		
}

exports.Gatherer = Gatherer