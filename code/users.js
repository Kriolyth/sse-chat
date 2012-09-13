var users = [];

var user = function( id, name ) {
	if ( name === undefined ) {
		// return user by ID
		return users[ String(id) ];
	}
	
	var new_user = { 
		id: id,
		name: name,
		last_active: (new Date()).getTime(),
		activeCount: 0
		stream: null,
		};
	return new_user;
}