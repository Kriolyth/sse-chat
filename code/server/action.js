/*
	Actions
	
	A bunch of "set actions" that are to be performed
*/

var channels = require('./channeldb.js').ChannelsDB;
var users = require('./userdb.js').UserDB;
var sessions = require( './session.js' ).Sessions;
var messages = require( './message.js' );

var dispatcher = require( './dispatcher.js' ).Dispatcher;

function joinChannel( user, channel ) {
	channel.addUser( user );
	enterChannel( user, channel );
}

function enterChannel( user, channel ) {
	// send service message to all user sessions
	var userMsg = messages.ServiceMsg( { 
		event: 'chanjoin',
		data: channel.serialize()
		} );
	var usersess = sessions.findUserSessions( [ user.id ] );
	usersess.forEach( function _UserPushMsg(s){ s.push( userMsg ); } );
	
	// send "entered" message to all users on channel
	var chanMsg = messages.SysMsg( channel, 'joined', { user: user.name } );
	var chansess = sessions.findUserSessions( channel.userList() );
	chansess.forEach( function _ChanPushMsg(s){ s.push( chanMsg ); } );
	
	 dispatcher.queue( usersess.concat( chansess ) );
}

exports.joinChannel = joinChannel;
exports.enterChannel = enterChannel;