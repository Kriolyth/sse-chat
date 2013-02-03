/*
	Sessions manager
	
	User management
	Single instance
*/

var Filter = require( './filter.js' ).Filter;
var KeepAlive = require( './keepalive.js' ).KeepAlive;
var Msg = require( './message.js' );
var ID = require( './id.js' ).ID;

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
	this.closeCallback = null;
}

// Switch to 'half-open' state for as long as 'timeout'
Session.prototype.halfOpen = function( timeout ) {
	this.openState = 1;
	// SessionDB.update( this );
	// TODO: encapsulate timeout into a closure
	this.timeoutId = setTimeout( (function(session){ return function _SessionOnClose(){session.onClose();}})(this), timeout );
}

// Associate with a connection
Session.prototype.attach = function( socket ) {
	this.openState = 2;
	
	clearTimeout( this.timeoutId );
	delete this.timeoutId;
	
	this.keepAlive = KeepAlive();
	this.keepAlive.on( (function(obj) {
			return function _KeepAlive() {
				obj.push( new Msg.KeepAliveMsg() ); 
				obj.send(); 
				return true;
			}
		})(this) );
	
	socket.once( 'close', (function(session){ return function _SessionOnClose(){session.onClose();}})(this) );
	this.socket = socket;
}

Session.prototype.onClose = function() {
	SessionDB.remove( this );
	
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
		if ( this.closeCallback )
			this.closeCallback( this );
	}
}

Session.prototype.setNotifyClose = function( func ) {
	//this.socket.once( 'close', function(x){ return function _SessionCloseNotifier(){func(x);} }(this) );
	this.closeCallback = func;
}

Session.prototype.push = function( msg ) {
	//require('util').puts( 'Queued msg ' + JSON.stringify( msg ) );					
	this.queue.push( msg );
}
Session.prototype.send = function() {
	if ( this.queue.length > 0 && ( this.socket !== null ) ) {
		var res = '';
		this.queue.forEach( function _SocketQueueMsgSerialize(msg) {
				res += msg.serialize();
			} );
			
		this.queue = [];
		this.socket.write( res );
		
		if ( this.keepAlive )
			this.keepAlive.reset();
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
		var reuse_idx = -1;
		
		new_session = (new Filter( { user: user.id } )).find( reusable );
		if ( new_session )
			reuse_idx = reusable.indexOf( new_session );
		
		if ( reuse_idx >= 0 ) {
			reusable.splice( reuse_idx, 1 );
			new_session.reset( new_session.id, user );
		} else {
			var id;
			while ( !id || sessions[id] )
				id = ID.newid();
			new_session = new Session( id, user );
		}
		
		sessions[ new_session.id ] = new_session;
		return new_session;
	}
	
	function removeSession( session ) {
		// mark session as reusable instead of removing
		delete sessions[ session.id ];
		reusable.push( session );
	}
	
	/*function updateSession( session ) {
		if ( session && session['id'] ) {
			sessions[ session.id ] = session;
			return true;
		}		
		return false;
	} */
	
	return {
		find: function( filter ) {
			return findSession( filter );
		},
		
		get: function( id ) {
			return sessions[ id ];
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
			//return updateSession( session );
			return true;
		},
		
		findUserSessions: function( users ) {
			// list all active sessions for specified users
			return sessions.filter( function _FindUserSessions(sess) {
				return ( 
					( sess.openState == 2 ) &&
					( users.indexOf( sess.user ) != -1 )
					);
			} );
		}
		
	}
		
}

var SessionDB = createSessionDB();
exports.Sessions = SessionDB;
