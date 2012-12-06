/*
	Channels database
	
	Channel management and storage
	Single instance
*/

var Filter = require( './filter.js' ).Filter;
var Channel = require( './channel.js' ).Channel;
var ID = require( './id.js' ).ID;

function createChannelsDB() {
		var channels = [];
		
		function findChan( filter ) {
			return (new Filter(filter)).find( channels );
		}
		function findChannelsForUser( user ) {
			if ( user['id'] === undefined ) return [];
			return channels.filter( function _ChanHasUser(chan) {
				return chan.hasUser( user );
			} );
		}
		
		function addChan( host_user ) {
			var id;
			while ( !id || channels[id] )
				id = ID.id2s( ID.newid() );

			var new_chan = new Channel( id );
			if ( host_user ) {
				new_chan.addUser( host_user, 'host' );
			}
			
			channels[ new_chan.id ] = new_chan;
			return new_chan;
		}
		
		return {
			find: function( filter ) {
				return findChan( filter );
			},
			
			get: function( id ) {
				return channels[ id ];
			},
			
			add: function( host_user ) {
				// new channel, add one
				return addChan( host_user );
			},
			
			update: function( chan ) {				
				if ( !chan['id'] ) return undefined;
				if ( !findChan( { id: chan.id } ) )
					return false;  // user not found
				else {
					// TODO: insert DB management code here
					channels[ chan.id ] = chan;
					return true;
				}
			},
			
			findUserChannels: function( user ) {
				return findChannelsForUser( user );
			}
		}
		
}

var ChannelsDB = createChannelsDB();
exports.ChannelsDB = ChannelsDB;