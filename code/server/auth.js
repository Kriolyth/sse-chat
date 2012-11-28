/*
	Auth processor
	
	Manages user authentication
	
	Depends on router and sessions
*/

var querystring = require( 'querystring' );
var UserDB = require( './userdb.js' ).UserDB;
var Sessions = require( './sessions.js' ).Sessions;

var AUTH_PIN_EXPIRED = { ok: false, status: 101, 
		message: 'Too many pin retries' },
	AUTH_PIN_INVALID = { ok: false, status: 102,
		message: 'Invalid PIN' },
	AUTH_NOT_ADDED   = { ok: false, status: 103,
		message: 'Could not add new user' },
	AUTH_NO_SESSION  = { ok: false, status: 201,
		message: 'Sorry, out of cookies' },
	AUTH_OK          = { ok: true, status: 0, message: 'Welcome aboard!' };

function AuthProcessor( router ) {
		// private scope
		
		// Process auth request
		function onAuthRequest( response, request, body ) {			
			var qs = querystring.parse( body );
			if ( !qs['name'] || !qs['id'] ) {
				return authError( response, 'Missing important fields in request' );
			}
			
			var user;
			if ( 0 == qs['id'] ) {
				// new user -- test if there is one
				user = UserDB.find( { name: qs['name'] } );
				if ( !user ) {
					// add one
					return newUser( response, qs );
				}
			} else {
				// existing user
				user = UserDB.find( { id: qs['id'] } );
				if ( !user ) {
					// no such id -- add one
					return newUser( response, qs );
				}
				// if name in DB does not match the given one, discard the given
			}
			
			// Existing user -- PIN is required at this stage
			if ( 0 == qs['pin'] ) 
				return authError( response, 'Missing important fields in request' );
			
			var auth_result = doAuth( user, qs );
			if ( !auth_result.ok )
				return authFailed( response, auth_result );
			
			return authOk( response, user );
		}
		
		function doAuth( user, qs ) {			
			if ( !qs['pin'] ) {
				// PIN not specified
				return AUTH_NO_PIN;
			} else if ( qs['pin'] != user['pin'] ) {
				// auth by pin failed
				user.pin_retries++;
				UserDB.update( user );
				if ( user.pin_retries > 3 ) {
					return AUTH_PIN_EXPIRED;
				}
				return AUTH_PIN_INVALID;
			} else
				return AUTH_OK;
		}
		
		function newUser( response, qs ) {
			user = UserDB.add( qs );
			if ( !user ) {  // some error occurred
				return authFailed( response, AUTH_NOT_ADDED );
			}
			
			user.new_user = 1;
			return authOk( response, user );	
		}
		
		function authFailed( response, detail ) {
			// return 200 with detail
			response.writeHead( 200, "OK", {
					'Content-Type': 'text/plain',
				} );
			response.write( JSON.stringify( detail, undefined, '\t' ) );
			response.end();
			
			return true;
		}
		function authOk( response, user ) {
			// register a new session and return session parameters to user
			var sess = Sessions.add( user );
			if ( !sess ) return authError( response, AUTH_NO_SESSION );
			
			var detail = AUTH_OK;
			detail.session = sess.id,
			detail.user: user.id,
			detail.username: user.name;
			if ( user['new_user'] ) {				
				detail.pin = user.pin;
				delete user.new_user;
			}
				
			response.writeHead( 200, "OK", {
					'Content-Type': 'text/plain',
				} );
			response.write( JSON.stringify( detail, undefined, '\t' ) );
			response.end();			
			
			// reset PIN retries counter
			user.pin_retries = 0;
			UserDB.update( user );
			
			return true;
		}

		function authError( response, detail ) {
			// return unroutable
			response.writeHead( 404, "Not Found", {
					'Content-Type': 'text/plain',
				} );
			var dump = { status: 404,
				httpVersion: request.httpVersion,
				method: request.method,
				url: request.url,
				headers: request.headers,
				detail: detail }
			response.write( JSON.stringify( dump, undefined, '\t' ) );
			response.end();
			
			return true;
		}

		// creation actions
		router.addHandler( { method: 'POST', url: '/auth' }, onAuthRequest );

		
		// public interface
		return {
			// NONE???
		}

	};

exports.AuthProcessor = AuthProcessor;