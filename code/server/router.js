/*
	Request Router
	
	Dispatches incoming requests to whatever handler
*/

/* Catcher object - early request rejection, based on a simple filter 

	A filter is an object with field names equa; to tested request fields.
	If filter field value is a string, it is tested for equality to appropriate request field.
	If filter field value is an object, it is considered a substring or regex (if 'regex' field is non-zero)
	
	E.g.:
	filter = {
		method: 'POST',    // equality
		url   : { regex: 0, '/post?' }  // first-letter substring
	}

*/
function Catcher( filter ) {
	this.filter = filter;
}
Catcher.prototype.catches = function( request ) {
	var match = true;
	
	// Ugly. Rewrite to smaller filter objects and parse filter on creation
	for ( var field in this.filter ) {
		if ( request[field] ) {
			switch ( typeof( this.filter[field] ) ) {
				case 'string': match = ( request[field] == this.filter[field] ); break;
				case 'object':
					if ( this.filter[field].regex ) 
						match = (new Regex( this.filter[field], "i" )).match( request[field] );
					else
						match = ( 0 == request[field].toLowerCase().indexOf( this.filter[field].toLowerCase() ) );
					break;
			}
		}
		if ( !match ) break;
	}
	
	return match;
}

function Handler( filter, func ) {
	this.catcher = new Catcher( filter );
	this.handler = func;
}
Handler.prototype.catches = function( request ) {
	return this.catcher.catches( request );
}
Handler.prototype.call = function( response, request, body ) {
	return this.func( response, request, body );
}

function Router() {
		// private scope
		var handlers = [];
		
		function addHandler( filter, func ) {
			handlers.push( new Handler( filter, func ) );
		}
		function process( response, request, body ) {
			for ( var i in handlers ) {
				if ( handlers[i].catches( request ) && 
					handlers[i].call( response, request, body ) )
					return true;
			}
			return false;
		}
		function unroutable( response, request ) {
			// return unroutable
			response.writeHead( 404, "Not Found", {
					'Content-Type': 'text/plain',
				} );
			response.write( JSON.stringify( request ) );
			response.end();
		}
		
		// public interface
		return {
			function route( response, request, body ) {
				// route request
				if (!process( response, request, body ) )
				{
					unroutable( response, request );
					return false;
				}
				
				return true;
			}
			
			function addHandler( filter, callback ) {
				addHandler( filter, func );
			}
			
		}

	};

function createListener( router ) {
	return Listener( router );
}
	
exports.createListener = createListener;