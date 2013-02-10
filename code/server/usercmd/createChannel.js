/*
	Create Channel command
*/

var Sessions = require( '../session.js' ).Sessions;
var Channels = require( '../channeldb.js' ).ChannelsDB;
var Messages = require( '../message.js' );
var Users = require('../userdb.js').UserDB;
var Actions = require('../action.js');

var Dispatcher = require( '../dispatcher.js' ).Dispatcher;

var MAX_CHANNELS_PER_USER = 40;

var CreateChannelCmd = ( function() {
	function respondOk( response ) {
		response.writeHead( 204, "K wait plz" );
		response.end();
	}
	
	function newchan( response, session, query ) {
		var user = Users.get( session.user );
		var chan = Channels.get( query.chan );
		if (!( user && chan && chan.hasUser( user ) ) ) {
			// something gone wrong
			return false;
		} else {
			respondOk( response );
		}
		
		if ( Channels.findUserChannels( user ).length > MAX_CHANNELS_PER_USER ) {
			var msg = new Messages.ChanServMsg( chan, 'Too many channels, please leave some' );
			session.push( msg );
			
			Dispatcher.queue( [session] );
			return true;
		}
		
		// create new channel
		var args = query.msg.split( ' ' ).splice( 1 );
		var new_chan = Channels.add();
		var name = ( ( args.length > 0 && args[0].trim() != '' ) ? args[0].trim() : 'Channel ' + new_chan.id );
		new_chan.name = name.substr( 0, 16 );
		new_chan.isPublic = false;
		
		Actions.joinChannel( user, new_chan );		
		
		return true;
	}
	return {
		filter: { msg: { match: '/createchan' } },
		func: newchan
	}
} )();
	
exports.Cmd = CreateChannelCmd;