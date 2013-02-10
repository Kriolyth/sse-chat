/*
	User Commands
	
	Captures user commands and processes them
*/

/*var url = require( 'url' );
var Filter = require( './filter.js' ).Filter;
var Sessions = require( './session.js' ).Sessions;
var Channels = require( './channeldb.js' ).ChannelsDB;
var Channel = require( './channel.js' ).Channel;
var Messages = require( './message.js' );
var QueryString = require( 'querystring' );
var Users = require('./userdb.js').UserDB;

var Dispatcher = require( './dispatcher.js' ).Dispatcher; */

var h_pin = require( './usercmd/pin.js' ).Cmd;
var h_createchan = require( './usercmd/createChannel.js' ).Cmd;
var h_leavechan = require( './usercmd/leaveChannel.js' ).Cmd;

function UserCmdHandler( msgrouter ) {

	
	// on creation actions
	msgrouter.addHandler( h_pin.filter, h_pin.func );
	msgrouter.addHandler( h_createchan.filter, h_createchan.func );
	msgrouter.addHandler( h_leavechan.filter, h_leavechan.func );
	
	// public interface
	return {
		// maybe some administrator settings interface
	}
		
};

	
exports.UserCmdHandler = UserCmdHandler;