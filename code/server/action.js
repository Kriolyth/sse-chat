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
	
	// send service message to all user sessions for the joined user
	var userMsg = new messages.ServiceMsg( { 
		event: 'join',
		data: channel.serialize()
		} );
	var usersess = sessions.findUserSessions( [ user.id ] );
	usersess.forEach( function _UserPushMsg(s){ s.push( userMsg ); } );
	dispatcher.queue( usersess );
	
	enterChannel( user, channel );
}
function leaveChannel( user, channel ) {
	channel.delUser( user );
	
	// send service message to all user sessions for the joined user
	var userMsg = new messages.ServiceMsg( { 
		event: 'leave',
		data: channel.serialize()
		} );
	var usersess = sessions.findUserSessions( [ user.id ] );
	usersess.forEach( function _UserPushMsg(s){ s.push( userMsg ); } );
	dispatcher.queue( usersess );

	exitChannel( user, channel );
}

function enterChannel( user, channel ) {
	// send "entered" message to all users on channel
	var chanMsg = new messages.SysMsg( channel, 'enter', { user: user.name } );
	var chansess = sessions.findUserSessions( channel.userList() );
	chansess.forEach( function _ChanPushMsg(s){ s.push( chanMsg ); } );
	
	 dispatcher.queue( chansess );
}

function exitChannel( user, channel ) {
	// send "left" message to all user sessions
	var chanMsg = new messages.SysMsg( channel, 'leave', { user: user.name } );
	var chansess = sessions.findUserSessions( channel.userList() );
	chansess.forEach( function _ChanPushMsg(s){ s.push( chanMsg ); } );
	
	 dispatcher.queue( usersess.concat( chansess ) );
}



exports.joinChannel = joinChannel;
exports.enterChannel = enterChannel;
exports.leaveChannel = leaveChannel;
exports.exitChannel = exitChannel;