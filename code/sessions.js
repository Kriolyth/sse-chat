ut = require('ut');

var sessions = [];
var sesByUser = [];

// A session is an active SSE connection with a browser
// It may only be created when user is authenticated, and so
// user object exists
var session = function( id, user ) {

	if ( id != 0 ) {
		// get session by ID
		return sessions[ id ];
	}
	
	var new_session = {
		id : ut.new_id(),
		user: user,
		stream: null,
		
		// storage-specific
		destroyCallbacks: [],
		
		addOwner: function( owner, removeFunc ) {
			if ( undefined === removeFunc )
				// if no removeFunc is given, we rely on 'remove'
				// method in owner
				this.destroyCallbacks.push( function(me){ owner.remove(me); } );
			else 
				// otherwise, we add a remover
				this.destroyCallbacks.push( function(me){ removeFunc( owner, me ); } );
		}
		destroy: function() {
			// remove ourselves from all collections			
			for ( var i in this.destroyCallbacks ) {
				this.destroyCallbacks[i]( this );
			}
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