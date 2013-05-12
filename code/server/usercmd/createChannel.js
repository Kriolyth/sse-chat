/*
	Create Channel command
*/

var Sessions = require( '../session.js' ).Sessions;
var Channels = require( '../channeldb.js' ).ChannelsDB;
var Messages = require( '../message.js' );
var Users = require('../userdb.js').UserDB;
var Actions = require('../action.js');

var Dispatcher = require( '../dispatcher.js' ).Dispatcher;
var QueryString = require( 'querystring' );

var MAX_CHANNELS_PER_USER = 40;

var CreateChannelCmd = ( function() {
	function respondOk( response ) {
		response.writeHead( 204, "K wait plz" );
		response.end();
	}
	
	function make_chan( session, name ) {
		var user = Users.get( session.user );

		if ( Channels.findUserChannels( user ).length > MAX_CHANNELS_PER_USER ) {
			var msg = new Messages.SysMsg( chan, 'info', 'Too many channels, please leave some' );
			session.push( msg );
			
			Dispatcher.queue( [session] );
			return true;
		}
		
		var new_chan = Channels.add();
		var chan_name = name.trim();
		if ( chan_name.length == 0 ) 
			chan_name = 'Channel ' + new_chan.id;
		new_chan.name = chan_name.substr( 0, 16 );
		new_chan.isPublic = false;
		
		Actions.joinChannel( user, new_chan );		
		return true;
	}
	
	function newchan_msg( response, session, query ) {
		var user = Users.get( session.user );
		var chan = Channels.get( query.chan );
		if (!( user && chan && chan.hasUser( user ) ) ) {
			// something gone wrong
			return false;
		}
		respondOk( response );
		
		// create new channel
		var args = query.msg.split( ' ' ).splice( 1 );
		make_chan( session, name ) 
		
		return true;
	}
	function newchan_cmd( response, session, query ) {
		// parse request body
		var user = Users.get( session.user );
		
		if (!( user ) ) {
			// something gone wrong
			return false;
		}
		respondOk( response );
		
		// create new channel
		make_chan( session, query.name );
		
		return true;
	}
	return [
		{ filter: { msg: { match: '/createchan' } },
		  func: newchan_msg },
		{ type: 'cmd', filter: { cmd: 'newchan' },
		  func: newchan_cmd }
	];
} )();
	
exports.Cmd = CreateChannelCmd;