/*
	Create Invite command
*/

var Sessions = require( '../session.js' ).Sessions;
var Channels = require( '../channeldb.js' ).ChannelsDB;
var Invites = require( '../invitedb.js' ).InvitesDB;
var Messages = require( '../message.js' );
var Users = require('../userdb.js').UserDB;
var Actions = require('../action.js');

var Dispatcher = require( '../dispatcher.js' ).Dispatcher;

var MAX_INVITES_PER_USER = 80;  // TODO: implement
var MSG_HELP = "Usage:\n\
/mkinvite [use_limit:nn]\n\
By default use_limit=1, so only one user may be invited using this invitation";

var CreateInviteCmd = ( function() {
	function respondOk( response ) {
		response.writeHead( 204, "K wait plz" );
		response.end();
	}
	
	function new_invite( response, session, query ) {
		var user = Users.get( session.user );
		var chan = Channels.get( query.chan );
		if (!( user && chan && chan.hasUser( user ) ) ) {
			// something gone wrong
			return false;
		} else {
			respondOk( response );
		}
		
		// create new Invite
		var opts = { use_limit: 1, expire_date: (new Date()).getTime() + 14*86400 };
		var args = query.msg.substring( String('/mkinvite').length + 1 );
		
		if ( args.length > 0 ) {
			try {
				JSON.parse( '{' + args + '}', function _InvArgParse(k,v) {
						if ( ['use_limit'].indexOf(k) >= 0 )
							opts[k] = v;
					}
				);
			} catch(e) {
				session.push( new Messages.ChanServMsg( chan, MSG_HELP ) );
				session.push( new Messages.ChanServMsg( chan, 'Your input: ' + args + '\n' + e ) );
				Dispatcher.queue( [session] );
				return true;
			}
		}
		var invite = Invites.add( opts );
		var reply = new Messages.ChanServMsg( chan, 'Your invitation to this channel: ' + invite.url() );
		session.push( reply );
		
		Dispatcher.queue( [session] );
		return true;
	}
	return [ 
		{ filter: { msg: { match: '/mkinvite' } },
		  func: new_invite }
	]
} )();
	
exports.Cmd = CreateInviteCmd;