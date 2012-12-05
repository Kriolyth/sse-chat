/*
	SSE Initiator
	
	Handles connection request to SSE socket (the GET query)
*/

var url = require( 'url' );
var Filter = require( './filter.js' ).Filter;
var Sessions = require( './session.js' ).Sessions;
var Channels = require( './channeldb.js' ).ChannelsDB;
var Messages = require( './message.js' );
var QueryString = require( 'querystring' );

var Dispatcher = require( './dispatcher.js' ).Dispatcher;

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
		if ( qs[id] === undefined )
			return invalidRequest( response );
		
		var session = Sessions.get( qs.id );
		if ( session === undefined )
			return notAuth( response );
		
		// TODO: add extra layer of authorisation by using
		// timed secret codes sent via SSE channel
		
		if ( !process( response, session, qs ) )
			defaultHandler( response, session, query );
		
		return true;
	}
	
	function defaultHandler( response, session, query ) {
		if ( !query[ 'chan' ] || !query[ 'msg' ] )
			return invalidRequest( response );
		
		var chan = Channels.get( query.chan );
		var user = Users.get( session.user );
		if ( !chan || !user || !chan.hasUser( user ) )
			return notAuth( response );
		
		// post message to the channel
		var chanUsers = chan.userList();
		var userSessions = Sessions.findUserSessions( chanUsers );
		var msg = new Messages.UserMsg( chan, user, text );
		userSessions.forEach( function _PostToUserSession(userSession) {
			userSession.push( msg );
		} );
		
		// reply to POST that the request was processed
		response.writeHead( 204, "K thx" );
		response.end();
		
		// queue sessions for sending
		Dispatcher.queue( userSessions );
		
		return true;
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
	router.addHandler( { method: 'POST', url: { match: '/message' } }, onMsg );
	
	// public interface
	return {
		addHandler: function( filter, callback ) {
			addHandler( filter, callback );
		}
		
	}

};

	
exports.MessageRouter = MessageRouter;