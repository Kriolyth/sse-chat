/*
	Sessions manager
	
	User management
	Single instance
*/

var Filter = require( './filter.js' ).Filter;
var KeepAlive = require( './keepalive.js' ).KeepAlive;
var Msg = require( './message.js' );

function new_id() {
	 return Math.floor( Math.random() * 1676214 ) + 1001;
}

/*
	Session object
*/

function Session( id, user ) {
	this.reset( id, user );
}
Session.prototype.reset = function( id, user ) {
	this.id = id;
	this.user = user.id;
	this.created = (new Date()).getTime();
	this.openState = 0;
	this.lastEventId = 0;   // keep track of messages
	this.socket = null;
	this.keepAlive = null;
	this.queue = [];        // message queue
}

// Switch to 'half-open' state for as long as 'timeout'
Session.prototype.halfOpen = function( timeout ) {
	this.openState = 1;
	// SessionDB.update( this );
	// TODO: encapsulate timeout into a closure
	this.timeoutId = setTimeout( (function(session){ return function(){session.onClose();}})(this), timeout );
}

// Associate with a connection
Session.prototype.attach = function( socket ) {
	this.openState = 2;
	
	clearTimeout( this.timeoutId );
	delete this.timeoutId;
	
	this.keepAlive = new KeepAlive();
	this.keepAlive.on( (function(obj){ return function(){ obj.push( new Msg.KeepAliveMsg() ); obj.send(); return true; } })(this) );
	
	socket.once( 'close', (function(session){ return function(){session.onClose();}})(this) );
	this.socket = socket;
}

Session.prototype.onClose = function() {
	this.socket = null;
	this.openState = 0;
	this.queue = [];
	
	if ( this.keepAlive ) {
		this.keepAlive.off();
		this.keepAlive = null;
	}
	
	if ( this.timeoutId ) {
		require('util').puts( 'Timeout for session ' + this.id );
		clearTimeout( this.timeoutId );
		delete this.timeoutId;
	} else {
		require('util').puts( 'Socket close for session ' + this.id );
	}
	
	SessionDB.remove( this );
}

Session.prototype.addNotifyClose = function( func ) {
	this.socket.once( 'close', function(x){ return function(){func(x);} }(this) );
}

Session.prototype.push = function( msg ) {
	this.queue.push( msg );
}
Session.prototype.send = function() {
	if ( this.queue.length > 0 ) {	
		var res = '';
		this.queue.forEach( function(msg) {
				res += msg.serialize();
			} );
		
		this.queue = [];
		this.socket.write( res );
	}
}

/*
	Session database
*/

function createSessionDB() {
	var sessions = [];
	var reusable = [];
	
	function findSession( filter ) {
		return (new Filter(filter)).find( sessions );
	}
	
	function newSession( user ) {
		if ( user['id'] == undefined )
			return undefined;
		
		var new_session;
		new_session = (new Filter( { user: user.id } )).find( reusable );
		if ( new_session ) {
			reusable.slice( reusable.indexOf( new_session ), 1 );
			new_session.reset( new_session.id, user );
		} else {
			var id;
			while ( !id || sessions[id] )
				id = new_id();
			new_session = new Session( id, user );
		}
		
		sessions[ new_session.id ] = new_session;
		return new_session;
	}
	
	function removeSession( session ) {
		// mark session as reusable instead of removing
		sessions[ session.id ] = session;
		reusable.push( session );
	}
	
	function updateSession( session ) {
		if ( session && session['id'] ) {
			sessions[ session.id ] = session;
			return true;
		}		
		return false;
	}
	
	return {
		find: function( filter ) {
			return findSession( filter );
		},
		
		add: function( user ) {
			if ( !user['id'] ) return undefined;
			var sess = newSession( user );
			return sess;
		},
		
		remove: function( session ) {
			if ( session && session['id'] ) {
				removeSession( session );
				return true;
			}
			
			return false;
		},
		
		update: function( session ) {
			return updateSession( session );
		}
		
	}
		
}

var SessionDB = createSessionDB();
exports.Sessions = SessionDB;
