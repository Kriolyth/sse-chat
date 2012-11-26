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

Channel.prototype.onJoin = function( session ) {
	session.addOwner( this, this.onDisconnect );
	this.sessions[ session.id ] = session;
	
	// lazy post a join message
}

Channel.prototype.onLeave = function( session ) {
	delete this.sessions[ session.id ];
	
	// find if it was the last session of a user
	var isLast = true;
	for ( var i in this.sessions ) {
		if ( this.sessions[i].user.id == session.user.id ) {
			isLast = false;
			break;
		}
	}
	
	if ( isLast ) {
		// lazy post a quit message
	}
}


// A channel object is a message history view + a number of
// active connections (sessions)
var channel = function( id, name ) {

	if ( id != 0 ) {
		// get session by ID
		return channels[ id ];
	}
	
	var new_channel = new Channel( name );
		
	sessions[ new_session.id ] = new_session;
	sesByUser[ new_session.user.id ] = new_session;
	new_session.addOwner( sessions, function( array, obj ) { delete array[obj.id]; } );
	new_session.addOwner( sesByUser, function( array, obj ) { delete array[obj.user.id]; } );
	
	return new_session;
}

function findByUser( user ) {
	return sesByUser[ user.id ];
}

exports.session = session;
exports.findByUser = findByUser;