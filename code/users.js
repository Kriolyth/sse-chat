ut = require('ut');

var users = [];

var user = function( id, name, pwd_hash ) {
	if ( name === undefined ) {
		if ( typeof id == 'number' ) {
			// return user by ID
			return users[ id ];
		} else if ( typeof id == 'string' ) {	
			// find user by name
			for ( var i in users ) {
				if ( users[i].name == id )
					return users[i];				
			}
			// we must not return a new user if search failed
			return undefined;
		}
	}
	
	// create a new user
	var new_user = { 
		id: ( id > 0 ? id :ut.id() ),
		name: name,
		last_active: (new Date()).getTime(),
		pwd_hash: ( pwd_hash === undefined ? '' : pwd_hash ),
		};
	users[ new_user.id ] = new_user;
	return new_user;
}

exports.user = user;