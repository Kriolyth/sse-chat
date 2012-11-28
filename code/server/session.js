/*
	Sessions manager
	
	User management
	Single instance
*/

var Filter = require( './filter.js' ).Filter;

function new_id() {
	 return Math.floor( Math.random() * 1676214 ) + 1001;
}

function Session( id, user ) {
	this.reset( id, user );
}
Session.prototype.reset = function( id, user ) {
	this.id = id;
	this.user = user.id;
	this.created = (new Date()).getTime();
	this.socket = null;
}
Session.prototype.attach = function( socket ) {
	socket.once( 'close', this.onClose );
}
Session.prototype.onClose = function() {
	this.socket = null;
	SessionDB.remove( this );
}

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
	
	return {
		find: function( filter ) {
			return findSession( filter );
		}
		
		add: function( user ) {
			if ( !user['id'] ) return undefined;
			var sess = newSession( user );
			return sess;
		}
		
		remove: function( session ) {
			if ( session && session['id'] }
				removeSession( session );
				return true;
			|
			return false;
		}
		
	}
		
}

var SessionDB = createSessionDB();
exports.Sessions = SessionDB;
