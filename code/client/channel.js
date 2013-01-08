function Channel( description ) { 
	this.id = description.id;
	this.name = description.name;
	this.title = description.title;
	
	this.active = false;
	this.history = [];
	
	this.containerNode = document.createElement( 'div' );
}

Channel.prototype.addMessage = function( msg ) {
	// Add message to channel history
	switch ( typeof( this.history[ msg.ts ] ) ) {
		case 'undefined': this.history[ msg.ts ] = msg; break;
		case 'string': this.history[ msg.ts ] = [ this.history[ msg.ts ], msg ]; break;
		case 'array': this.history.push( msg ); break;
	}
	console.log( 'Message added' );
	console.log( msg );
	
	this.addNodeMessage( msg );
}

Channel.prototype.addNodeMessage = function( msg ) {
	// create a node
	var msgNode = this.createMessageNode( msg );
	
	// find where to place the node
	var nextNode = this.findNodeAt( msg.ts );
	if ( nextNode == null )
		this.containerNode.appendChild( msgNode );
	else
		this.containerNode.insertBefore( msgNode, nextNode );
}

Channel.prototype.findNodeAt = function( ts ) {
	if ( !this.containerNode.hasChildNodes() )
		return null;
	else if ( this.containerNode.firstChild.dataset.ts >= ts )
		return this.containerNode.firstChild;
	else if ( ts >= this.containerNode.lastChild.dataset.ts )
		return null;
	
	// Common cases are over, now do stupid loop search
	var node = this.containerNode.firstChild;
	while ( node = node.nextSibling ) {
		if ( node.nodeType == Node.ELEMENT_NODE && 
			 node.dataset.ts >= ts )
			break;
	}
	
	return node;
}

Channel.prototype.createMessageNode = function( msg ) {
	var node;
	if ( msg[ 'cmd' ] !== undefined ) {
		node = document.createElement( 'aside' );
		node.appendChild( document.createTextNode( JSON.stringify( msg ) ) );
	} else {
		node = document.createElement( 'article' );
		node.appendChild( document.createTextNode( JSON.stringify( msg ) ) );
	}
	
	node.dataset.ts = msg.ts;
	return node;
}

Channel.prototype.join = function(msg) {
	this.addMessage( { ts: (new Date()).getTime(), cmd: 'join', detail: msg } );
	this.active = true;
}
Channel.prototype.enter = function(msg) {
	this.addMessage( { ts: (new Date()).getTime(), cmd: 'enter', detail: msg } );
}
Channel.prototype.exit = function(msg) {
	this.addMessage( { ts: (new Date()).getTime(), cmd: 'exit', detail: msg } );
}
Channel.prototype.leave = function(msg) {
	this.addMessage( { ts: (new Date()).getTime(), cmd: 'leave', detail: msg } );
	this.active = false;
}
