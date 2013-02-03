var util = require('util');
var querystring = require( 'querystring' );

var ADDR = '127.0.0.1';
var PORT = 8002;

util.puts('Starting server at http://localhost:' + PORT);

process.on('uncaughtException', function (e) {
  try {
    util.puts('Caught exception: ' + e + ' ' + (typeof(e) === 'object' ? e.stack : ''));
  } catch (e0) {}
});

var router = require('./server/router.js').Router();
var listener = require('./server/listener.js').Listener( router );
var auth = require('./server/auth.js').AuthProcessor( router );
var initiator = require('./server/initiator.js').Initiator( router );
var channels = require('./server/channeldb.js').ChannelsDB;
var msgRouter = require('./server/msgrouter.js').MessageRouter( router );
var users = require('./server/userdb.js').UserDB;
var sessions = require('./server/session.js').Sessions;
var actions = require('./server/action.js');
var helpmsg = require('./server/helpmsg.js').HelpMsg;


var defaultChan = channels.add();
defaultChan.name = 'Public';

function welcomeProc( session ) {
	util.puts( 'Welcome to session ' + session.id );
	session.setNotifyClose( goodbyeProc );
	var user = users.get( session.user );
	var userchans = channels.findUserChannels( user );
	if ( userchans.length > 0 ) {
		util.puts( 'Loading channels for user ' + user.name );
		actions.listChannels( session );
		var userSessions = sessions.findUserSessions( [ user.id ] );
		var userSessCount = userSessions.length;
		userchans.forEach( function _UserChansEnter(chan){
			if ( userSessCount == 1 ) {
				// do not notify channel on second session
				actions.enterChannel( user, chan );
			}
			// TODO: loadHistory
		} );
	} else {
		// no channels for user 
		util.puts( 'Joining default channel for user ' + user.name + ', pin ' + user.pin );
		actions.joinChannel( user, defaultChan );
	}
}

function goodbyeProc( session ) {
	util.puts( 'Goodbye to session ' + session.id );
	var user = users.get( session.user );
	var userSessions = sessions.findUserSessions( [ user.id ] );
	var userSessCount = userSessions.length;
	if ( userSessCount == 0 ) {
		// user left
		util.puts( 'User ' + user.name + ' has left' );
		var userchans = channels.findUserChannels( user );
		userchans.forEach( function _UserChansExit(chan){
			actions.exitChannel( user, chan );
		} );
	}
}

initiator.setWelcomeProc( welcomeProc );

auth.setHalfopenTimeout( 15000 );

listener.listen( PORT, ADDR );