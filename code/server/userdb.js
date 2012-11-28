/*
	User database
	
	User management
	Single instance
*/

var Filter = require( './filter.js' ).Filter;

function new_id() {
	 return Math.floor( Math.random() * 1676214 ) + 1001;
}
function new_pin() {
	 return Math.floor( Math.random() * 8998 ) + 1001;
}

function createUserDB() {
		var users = [];
		
		function findUser( filter ) {
			return (new Filter(filter)).find( users );
		}
		
		function addUser( user ) {
			if ( !user['name'] )
				return undefined;
				
			var id;
			while ( !id || users[id] )
				id = new_id();

			var new_user = {
				id: id,
				name: user['name'],
				pin: new_pin(),
				pin_retries: 0,
				privilege: 0
			};
			
			users[ new_user.id ] = new_user;
			return new_user;
		}
		
		return {
			find: function( filter ) {
				return findUser( filter );
			},
			
			add: function( user ) {
				if ( !user['name'] ) return undefined;
				if ( !findUser( { name: user['name'] } ) ) {
					// new user, add the guy
					var new_user = addUser( user );
					return new_user;
				}
				return false;
			},
			
			update: function( user ) {				
				if ( !findUser( { id: user['id'] } ) )
					return false;  // user not found
				else {
					users[ user['id'] ] = user;
					return true;
				}
			}
		}
		
}

var UserDB = createUserDB();
exports.UserDB = UserDB;