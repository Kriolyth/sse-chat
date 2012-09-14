ut = require('ut');

var channels = [];
var chansByUser = [];

function Channel( name ) {
	this.id = ut.new_id();
	this.name = name;
	this.pwd = '';
	this.sessions = [];
	this.history = [];
}

Channel.prototype.isProtected = function() { 
	return this.pwd == ''; 
}

// A channel object is a message history view + a number of
// active connections (sessions)
var channel = function( id, name ) {

	if ( id != 0 ) {
		// get session by ID
		return channels[ id ];
	}
	
	var new_channel = {
		id : ut.new_id(),
		name: name,
		pwd: '',
		sessions: [],
		history: [],
		
		isProtected: function() { return this.pwd == ''; }
		onDisconnect: function( session ) {
			delete sessions[ session.id ];
			
			// find if it was the last session of a user
			
		}
		
		join: function( session ) {
			session.addOwner( this, this.onDisconnect );
			this.sessions[ session.id ] = session;
		}
	};
		
	sessions[ new_session.id ] = new_session;
	sesByUser[ new_session.user.id ] = new_session;
	new_session.addOwner( sessions, ut.deleter[ sessions ] );
	new_session.addOwner( sesByUser, ut.deleter[ sesByUser ] );	
	
	return new_session;
}

function findByUser( user ) {
	return sesByUser[ user.id ];
}

exports.session = session;
exports.findByUser = findByUser;