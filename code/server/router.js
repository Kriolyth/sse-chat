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
		url   : { regex: '^/post?' }  // regex
		query : { match: '/post?' }  // first-letter substring
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
						match = (new RegExp( this.filter[field].regex )).test( request[field] );
					else if ( this.filter[field].match )
						match = ( 0 == request[field].indexOf( this.filter[field].match ) );
					else
						match = false;
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
	return this.handler( response, request, body );
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
			var dump = { status: 404,
				httpVersion: request.httpVersion,
				method: request.method,
				url: request.url,
				headers: request.headers }
			response.write( JSON.stringify( dump, undefined, '\t' ) );
			response.end();
		}
		
		// public interface
		return {
			route: function( response, request, body ) {
				// route request
				if (!process( response, request, body ) )
				{
					unroutable( response, request );
					return false;
				}
				
				return true;
			},
			
			addHandler: function( filter, callback ) {
				addHandler( filter, callback );
			}
			
		}

	};

exports.Router = Router;