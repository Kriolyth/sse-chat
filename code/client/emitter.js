function EventEmitter() {
	this.listeners = {};
}

EventEmitter.prototype.addListener = function( event, f, tag ) {
	// Add listener to an event
	if ( this.listeners[ event ] !== undefined ) {
		this.listeners[ event ].handlers.push( { h: f, tag: tag } );
	} else {
		this.listeners[ event ] = { 
			handlers: [ { h: f, tag: tag } ]
		};
	}
		
	return this;
}

EventEmitter.prototype.emit = function( event ) {
	if ( this.listeners[ event ] === undefined )
		return;
		
	var args = Array.prototype.slice.call( arguments );
	args.splice( 0, 1 );
	this.listeners[ event ].handlers.forEach( function _EmitEvent(x) {		
		x.h.apply( undefined, args );
	} );
}