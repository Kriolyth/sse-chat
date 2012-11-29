/*
	Request Router
	
	Dispatches incoming requests to whatever handler
*/

var Filter = require( './filter.js' ).Filter;

function Handler( filter, func ) {
	this.catcher = new Filter( filter );
	this.handler = func;
}
Handler.prototype.catches = function( request ) {
	return this.catcher.match( request );
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
				headers: request.headers,
				detail : 'unroutable'
			};
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