/*
	User database
	
	User management
	Single instance
*/

var Filter = require( './filter.js' ).Filter;
var ID = require( './id.js' ).ID;

function new_pin() {
	 return Math.floor( Math.random() * 8998 ) + 1001;
}

function User( id, name ) {
	this.id = id;
	this.name = name;
	this.pin = new_pin();
	this.pin_retries = 0;
	this.privilege = 0;
	
	this.login = '';
}

User.prototype.isRegistered = function() {
	return this.login != '';
}

function createUserDB() {
	var users = [];
	
	function findUser( filter ) {
		return (new Filter(filter)).find( users );
	}
	
	function addUser( user ) {
		// Allow users with same name
		//if ( !user['name'] )
		//	return undefined;
			
		var id;
		while ( !id || users[id] )
			id = ID.newid();

		var new_user = new User( id, user.name );
		
		users[ new_user.id ] = new_user;
		return new_user;
	}
	
	return {
		find: function( filter ) {
			return findUser( filter );
		},
		
		get: function( id ) {
			return users[ id ];
		},
		
		add: function( user ) {
			if ( !user['name'] ) return undefined;
			if ( !findUser( { name: user.name } ) ) {
				// new user, add the guy
				var new_user = addUser( user );
				return new_user;
			}
			return false;
		},
		
		update: function( user ) {				
			if ( !user['id'] ) return undefined;
			if ( !findUser( { id: user.id } ) )
				return false;  // user not found
			else {
				users[ user.id ] = user;
				return true;
			}
		}
	}
		
}

var UserDB = createUserDB();
exports.UserDB = UserDB;