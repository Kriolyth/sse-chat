/*
	Message Router
	
	Routes messages to their handlers.
	Also provides a default (and most common) "user message".
*/

var url = require( 'url' );
var Filter = require( './filter.js' ).Filter;
var Sessions = require( './session.js' ).Sessions;
var QueryString = require( 'querystring' );
var Users = require('./userdb.js').UserDB;

var Dispatcher = require( './dispatcher.js' ).Dispatcher;

function Handler( filter, func ) {
	this.catcher = new Filter( filter );
	this.handler = func;
}
Handler.prototype.catches = function( query ) {
	return this.catcher.match( query );
}
Handler.prototype.call = function( response, session, query ) {
	return this.handler( response, session, query );
}


function CommandRouter( router ) {
	// private scope
	var handlers = [];
	var requestRouter = router;
	
	function process( response, session, qs ) {
		for ( var i in handlers ) {
			if ( handlers[i].catches( qs ) && 
				handlers[i].call( response, session, qs ) )
				return true;
		}
		return false;
	}

	// Message handler
	function onMsg( response, request, body ) {
		// parse request body
		var qs = QueryString.parse( body );
		if ( qs['id'] === undefined )
			return invalidRequest( response );
		
		var session = Sessions.get( qs.id );
		if ( session === undefined )
			return notAuth( response );
		
		// TODO: add extra layer of authentication by using
		// timed secret codes sent via SSE channel
		
		return process( response, session, qs );
	}
	
	function invalidRequest( response ) {
		response.writeHead( 404, "Not found", {
				'Content-Type': 'text/plain',
			} );
		response.write( 'Never mind. Bad luck, probably.' );
		response.end();
		return true;
	}
	function notAuth( response ) {
		response.writeHead( 403, "Forbidden", {
				'Content-Type': 'text/plain',
			} );
		response.write( 'Yep. Just that.' );
		response.end();
		return true;
	}
	
	// on creation actions
	router.addHandler( { method: 'POST', url: { match: '/cmd' } }, onMsg );
	
	// public interface
	return {
		addHandler: function( filter, callback ) {
			handlers.push( new Handler( filter, callback ) );
		}
		
	}

};

	
exports.CommandRouter = CommandRouter;