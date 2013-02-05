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
		var newPin = query.msg.substr( 4 ).trim();
		var user = Users.get( session.user );
		var chan = Channels.get( query.chan );
		if (!( user && chan ) ) {
			// something gone wrong
			return false;
		} else {
			respondOk( response );
		}
		
		if ( '' == newPin ) {
			// request current pin
			var msg = new Messages.UserMsg( chan, { name: 'System' }, 'Your pin is: ' + user.pin );
			session.push( msg );
		} else {
			// set new pin
			var msg = new Messages.UserMsg( chan, { name: 'System' }, 'Sorry, not supported yet :) You requested pin ' + newPin );
			session.push( msg );
		}
		
		Dispatcher.queue( [session] );
		return true;
	}
	return {
		filter: { msg: { match: '/pin' } },
		func: pin
	}
} )();
	
exports.Cmd = PinCmd;