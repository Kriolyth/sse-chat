/*
	Leave Channel command
*/

var Sessions = require( '../session.js' ).Sessions;
var Channels = require( '../channeldb.js' ).ChannelsDB;
var Messages = require( '../message.js' );
var Users = require('../userdb.js').UserDB;
var Actions = require('../action.js');

var Dispatcher = require( '../dispatcher.js' ).Dispatcher;

var LeaveChannelCmd = ( function() {	
	function respondOk( response ) {
		response.writeHead( 204, "K wait plz" );
		response.end();
	}
	
	function leavechan( response, session, query ) {
		var user = Users.get( session.user );
		var chan = Channels.get( query.chan );
		if (!( user && chan && chan.hasUser( user ) ) ) {
			// something gone wrong
			return false;
		} else {
			respondOk( response );
		}
		
		Actions.leaveChannel( user, chan );		
		
		return true;
	}
	return {
		filter: { msg: { match: '/leave' } },
		func: leavechan
	}
} )();
	
exports.Cmd = LeaveChannelCmd;