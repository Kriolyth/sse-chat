/*
	SSE Initiator
	
	Handles connection request to SSE socket (the GET query)
*/

var url = require( 'url' );
var Filter = require( './filter.js' ).Filter;
var Sessions = require( './session.js' ).Sessions;
var QueryString = require( 'querystring' ).Sessions;

function Handler( filter, func ) {
	this.catcher = new Filter( filter );
	this.handler = func;
}
Handler.prototype.catches = function( query ) {
	return this.catcher.match( query );
}
Handler.prototype.call = function( session, query ) {
	return this.handler( session, query );
}


function MessageRouter( router ) {
	// private scope
	var handlers = [];
	var requestRouter = router;
	
	function process( session, qs ) {
		for ( var i in handlers ) {
			if ( handlers[i].catches( qs ) && 
				handlers[i].call( session, qs ) )
				return true;
		}
		return false;
	}

	function onMsg( response, request, body ) {
		// parse body into 
		var qs = QueryString.parse( body );
		
		if ( !process( session, qs ) )
			defaultHandler( session, query );
		
		return true;
	}
	
	function defaultHandler( session, query ) {
	}
	
	// on creation actions
	router.addHandler( { method: 'POST', url: { match: '/message' } }, onMsg );
	
	// public interface
	return {
		route: function( session, query ) {
			// route request
			
			return true;
		},
		
		addHandler: function( filter, callback ) {
			addHandler( filter, callback );
		}
		
	}

};

	
exports.MessageRouter = MessageRouter;