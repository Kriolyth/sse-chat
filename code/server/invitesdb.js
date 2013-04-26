/*
	Channel invites database
	
	Manages and stores invitations and permalinks to channels
	Single instance
*/

var Filter = require( './filter.js' ).Filter;
var Invite = require( './invite.js' ).Invite;
var ID8 = require( './id.js' ).ID8;

function createInvitesDB() {
		var invites  = [];
		
		function findInvite( filter ) {
			return (new Filter(filter)).find( invites );
		}
		
		function makeInvite( options ) {
			var id;
			while ( !id || invites[id] )
				id = ID8.newid();

			options.id = id;
			var new_invite = new Invite( options );
			
			invites[ id ] = invite;
			return invite;
		}
		
		return {
			find: function( filter ) {
				return findInvite( filter );
			},
			
			get: function( id ) {
				return invites[ id ];
			},
			
			add: function( options ) {
				// make new invitation/permalink
				return makeInvite( options );
			},
			
			update: function( invitation ) {				
				if ( !invitation['id'] ) return undefined;
				if ( !findInvite( { id: invitation.id } ) )
					return false;  // user not found
				else {
					// TODO: insert DB management code here
					invites[ invitation.id ] = invitation;
					return true;
				}
			}
			
		}
		
}

var InvitesDB = createInvitesDB();
exports.InvitesDB = InvitesDB;