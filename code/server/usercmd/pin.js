/*
	PIN request/set command
*/

var Sessions = require( '../session.js' ).Sessions;
var Channels = require( '../channeldb.js' ).ChannelsDB;
var Messages = require( '../message.js' );
var Users = require('../userdb.js').UserDB;

var Dispatcher = require( '../dispatcher.js' ).Dispatcher;


var PinCmd = ( function() {	
	function respondOk( response ) {
		response.writeHead( 204, "K wait plz" );
		response.end();
	}
	
	function pin( response, session, query ) {
		var user = Users.get( session.user );
		var chan = Channels.get( query.chan );
		if (!( user && chan && chan.hasUser( user ) ) ) {
			// something gone wrong
			return false;
		} else {
			respondOk( response );
		}
		
		// request current pin
		var msg = new Messages.SysMsg( chan, 'info', 'Your pin is: ' + user.pin );
		session.push( msg );
		
		Dispatcher.queue( [session] );
		return true;
	}
	return {
		filter: { msg: { match: '/pin' } },
		func: pin
	}
} )();
	
exports.Cmd = PinCmd;