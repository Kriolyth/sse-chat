function Channel( description ) { 
	this.id = description.id;
	this.name = description.name;
	
	this.unreadCount = 0;
	
	this.history = [];
}

Channel.prototype.addMessage = function( msg ) {
	// Add message to channel history
	switch ( typeof( this.history[ msg.ts ] ) ) {
		case 'undefined': this.history[ msg.ts ] = msg; break;
		case 'string': this.history[ msg.ts ] = [ this.history[ msg.ts ], msg ]; break;
		case 'array': this.history.push( msg ); break;
	}
}