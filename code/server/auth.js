/*
	Auth processor
	
	Manages user authentication
	
	Depends on router and sessions
*/

var querystring = require( 'querystring' );
var UserDB = require( './userdb.js' );

var AUTH_PIN_EXPIRED = { ok: false, status: 101, 
		message: 'Too many pin retries' },
	AUTH_PIN_INVALID = { ok: false, status: 102,
		message: 'Invalid PIN' },
	AUTH_OK = { ok: true, status: 0, message: 'Welcome aboard!' };

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
				user = UserDB.find( qs['name'] );
				if ( !user ) {
					// add one
					user = UserDB.add( qs );
					return authOk( response, user );
				}
			} else {
				// existing user
				user = UserDB.find( { id: qs } );
			}
			
			// Existing user -- PIN is required at this stage
			if ( 0 == qs['pin'] ) 
				return authError( response, 'Missing important fields in request' );
			
			var auth_result = doAuth( user, qs );
			if ( !auth_result.ok )
				return authFailed( response, auth_result );
			
			return authOk( response, user );
		}
		
		function doAuth( user ) {			
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
			
			response.writeHead( 200, "OK", {
					'Content-Type': 'text/plain',
				} );
			response.write( JSON.stringify( user, undefined, '\t' ) );
			response.end();
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
		router.addHandler( { method: 'POST'. url: '/auth' }, onAuthRequest );

		
		// public interface
		return {
			// NONE???
		}

	};

exports.AuthProcessor = AuthProcessor;