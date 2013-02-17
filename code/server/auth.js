/*
	Auth processor
	
	Manages user authentication
	
	Depends on router and sessions
*/

var querystring = require( 'querystring' );
var UserDB = require( './userdb.js' ).UserDB;
var Sessions = require( './session.js' ).Sessions;

var AUTH_PIN_EXPIRED = function() { return { ok: false, status: 101, 
		message: 'Too many pin retries' } },
	AUTH_PIN_INVALID = function() { return { ok: false, status: 102,
		message: 'Invalid username or PIN' } },
	AUTH_NOT_ADDED   = function() { return { ok: false, status: 103,
		message: 'Could not add new user' } },
	AUTH_USE_MEMBER_AUTH = function() { return { ok: false, status: 104,
		message: 'Please user member authentication' } },
	AUTH_NO_SESSION  = function() { return { ok: false, status: 201,
		message: 'Sorry, out of cookies' } },
	AUTH_OK          = function() { return { ok: true, status: 0, 
		message: 'Welcome aboard!' } };

function AuthProcessor( router ) {
	// private scope
	var halfopen_timeout = 3000;
	
	// Process auth request
	function onAuthRequest( response, request, body ) {			
		var qs = querystring.parse( body );
		if ( qs['isGuest'] === undefined ) {
			return authError( response, 'Missing important fields in request' );
		}
		
		var user;
		if ( qs.isGuest ) {
			if ( qs['name'] === undefined || qs['id'] === undefined )
				return authError( response, 'Missing important fields in request' );
			
			user = authGuest( qs.id, qs.name );
			if ( !user )
				return authFailed( response, AUTH_NOT_ADDED() );
			else if ( user.isRegistered() )
				return authFailed( response, AUTH_USE_MEMBER_AUTH() );
			else
				return authOk( response, user );
		}
		
		// Existing user -- login and PIN are required at this stage
		if ( qs['login'] === undefined || qs['pin'] === undefined )
			return authError( response, 'Missing important fields in request' );
		
		user = findMember( qs.login );
		if ( !user )
			return authFailed( response, AUTH_PIN_INVALID() );
		
		var auth_result = doAuth( user, qs.pin );
		if ( !auth_result.ok )
			return authFailed( response, auth_result );
		
		return authOk( response, user );
	}
	
	function findMember( login ) {
		var user;
		user = UserDB.find( { login: login } );
		if ( user && user.isRegistered() )
			return user;
		else
			return false;
	}
	function authGuest( id, username ) {
		var user;
		if ( 0 == id ) {
			// add new user
			//return newUser( response, qs );
			user = UserDB.add( { name: username } );
		} else {
			user = UserDB.get( id );
			if ( !user || user.name != username ) {
				// if ID is invalid or names do not match, create a new user
				user = UserDB.add( { name: username } );
			}
		}
		return user;
	}
	
	function doAuth( user, pin ) {		
		if ( pin != user.pin ) {
			// auth by pin failed
			user.pin_retries++;
			UserDB.update( user );
			if ( user.pin_retries > 3 ) {
				return AUTH_PIN_EXPIRED();
			}
			return AUTH_PIN_INVALID();
		}
		
		// reset PIN retries
		if ( user.pin_retries != 0 ) {
			user.pin_retries = 0;
			UserDB.update( user );
		}
		return AUTH_OK();
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
		if ( !sess ) {
			return authError( response, AUTH_NO_SESSION() );
		}
		sess.halfOpen( halfopen_timeout );
		
		var detail = AUTH_OK();
		detail.session = sess.id,
		detail.userId = user.id,
		detail.username = user.name;
			
		response.writeHead( 200, "OK", {
				'Content-Type': 'text/plain',
			} );
		response.write( JSON.stringify( detail, undefined, '\t' ) );
		response.end();			
		
		return true;
	}

	function authError( response, detail ) {
		// return unroutable
		response.writeHead( 404, "Not Found", {
				'Content-Type': 'text/plain',
			} );
		var dump = { status: 404,
			/*httpVersion: request.httpVersion,
			method: request.method,
			url: request.url,
			headers: request.headers, */
			detail: detail };
		response.write( JSON.stringify( dump, undefined, '\t' ) );
		response.end();
		
		return true;
	}

	// creation actions
	router.addHandler( { method: 'POST', url: '/auth' }, onAuthRequest );

	
	// public interface
	return {
		setHalfopenTimeout: function( timeout ) {
			halfopen_timeout = timeout;
		}
	}

};

exports.AuthProcessor = AuthProcessor;