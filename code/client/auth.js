function Auth( id, name ) {
	this.creds = { id: id, name: name };
	this.ok = this.err = this.fatal = this.defaultHandler;
}

Auth.prototype.auth = function( pin ) {
	var xhr = new XMLHttpRequest();
	xhr.open( 'POST', server_host + 'server/auth', true );
	xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
	xhr.onreadystatechange = (function _wrapXhr(t,x){ return function(){t.handleXhr(x);} })(this,xhr);
	
	var authData = { id: this.creds.id, name: this.creds.name };
	console.log( 'auth string: ' + dataObj );
	if ( pin !== unassigned )
		authData.pin = pin;
		
	var dataObj = encodeObject( authData );
	xhr.send( dataObj );
}

Auth.prototype.handleXhr = function( xhr ) {
	if ( xhr.readyState === 4 && xhr.status == 200 ) {
		var response = JSON.parse( xhr.responseText );
		
		if ( response.ok ) 
			this.ok( response );
		else 
			this.err( response );
	} else if ( xhr.readyState === 4 ) {
		this.fatal( xhr.responseText );
		/*if ( response != '' )
			fatal( 'Server says "' + response + '", but we have no idea what that means' );
		else
			showLoginError( 'Sorry, we have no idea what just happened' ); // */
	}
}

Auth.prototype.defaultHandler = function( response ) {
	console.log( 'auth response: ' + JSON.stringify( response ) );
}