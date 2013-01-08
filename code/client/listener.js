/*  
	Listener
	Opens an SSE connection and receives all the events.
	Then sends them to processor
*/

function Listener( processor ) { 
	this.processor = processor;
	this.lastEventId = '';
	
	this.uri = '';
	
	this.message = this.error = this.reconnecting = this.open = function _ListenerEmptyHandler() {};
}

Listener.prototype.listen = function( uri ) {
	// Only start listener after we authorized
	this.uri = uri;
	this.es = new EventSource( uri );
		
	// Chat message listener
	this.es.addEventListener( 'sv', (function(t){ return function(ev){t.onServiceMessage(ev);} })(this) );
	this.es.addEventListener( 'cmd', (function(t){ return function(ev){t.onChannelMessage(ev);} })(this) );
	this.es.addEventListener( 'message', (function(t){ return function(ev){t.onMessage(ev);} })(this) );
	this.es.addEventListener( 'open', (function(t){ return function(){t.onOpen();} })(this) );
	this.es.addEventListener( 'error', (function(t){ return function(){t.onError();} })(this) );
}

Listener.prototype.reconnect = function() {
	console.info( 'SSE forced reconnect to ' + this.uri );
	this.listen( this.uri );
}

Listener.prototype.onServiceMessage = function( event ) {
	var raw = JSON.parse( event.data )

	this.processor.handleServiceMsg( raw );
}
Listener.prototype.onChannelMessage = function( event ) {
	var raw = JSON.parse( event.data )

	this.processor.handleChannelMsg( raw );
}
Listener.prototype.onMessage = function( event ) {
	var raw = JSON.parse( event.data )

	this.processor.handleUserMsg( raw );
}

Listener.prototype.onOpen = function() {
	if ( this.es.readyState == EventSource.OPEN ) {
		console.info( 'SSE opened' );
		this.open();
	} else {
		console.warn( 'SSE open fired in a non-OPEN state' );
	}
}

Listener.prototype.onError = function() {
	if ( this.es.readyState == EventSource.CLOSED ) {
		this.error();
	} else if ( this.es.readyState == EventSource.CONNECTING ) {
		console.info( 'SSE reconnecting' );
		this.reconnecting();
	} else {
		console.warn( 'SSE error fired in an OPEN state' );
	}
}