function Channel( description ) { 
	this.id = description.id;
	this.name = description.name;
	this.title = description.title;
	
	this.active = false;
	this.history = [];
	
	this.containerNode = document.createElement( 'section' );
}

Channel.prototype.addMessage = function( msg ) {
	// Add message to channel history
	var ts = msg.ts;
	while ( typeof( this.history[ts] ) != 'undefined' )
		++ts;
	this.history[ ts ] = msg;

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
	else if ( ts >= this.containerNode.lastChild.dataset.ts )
		return null;
	else if ( this.containerNode.firstChild.dataset.ts >= ts )
		return this.containerNode.firstChild;
	
	// Common cases are over, now do stupid loop search
	var node = this.containerNode.firstChild;
	while ( node = node.nextSibling ) {
		if ( node.nodeType == Node.ELEMENT_NODE && 
			 node.dataset.ts > ts )
			break;
	}
	
	return node;
}

Channel.prototype.createMessageNode = function( msg ) {
	function fillNode( node, who, ts, text ) {
		var whoNode = document.createElement( 'div' ),
		    tsNode = document.createElement( 'div' ),
		    msgNode = document.createElement( 'div' );
		// and "from" part
		if ( who.trim() != '' ) {
			whoNode.appendChild( document.createTextNode( who.trim() ) );
			whoNode.setAttribute( 'class', 'author' );
			node.appendChild( whoNode );
		}
		// add timestamp part 
		var tsText = ( new Date(ts) ).format( 'HH:MM' );
		tsNode.appendChild( document.createTextNode( tsText ) );
		tsNode.setAttribute( 'class', 'timestamp' );
		
		node.appendChild( tsNode );
		
		// process the message through textProcessor and add to the parent node		
		msgNode.appendChild( document.createTextNode( text ) );
		msgNode.setAttribute( 'class', 'text' );
		node.appendChild( textProcessor.process( msgNode ) );
	}

	var node;
	if ( msg[ 'cmd' ] !== undefined ) {
		node = document.createElement( 'aside' );
		//node.appendChild( document.createTextNode( JSON.stringify( msg ) ) );
		switch ( msg.cmd ) {
			case 'enter': fillNode( node, '', msg.ts, 'Это же ' + msg.detail.data.user + '!' ); break;
			case 'exit': fillNode( node, '', msg.ts, 'Пока, ' + msg.detail.data.user + '!' ); break;
			case 'join': fillNode( node, '', msg.ts, 'Слава роботам!' ); break;
			case 'info': fillNode( node, '', msg.ts, msg.detail.data ); break;
			case 'leave': fillNode( node, '', msg.ts, 'Роботам слава!' ); break;
			default: fillNode( node, '', msg.ts, 'Влатсь роботам!' );
		}
	} else {
		node = document.createElement( 'article' );
		fillNode( node, msg.user, msg.ts, msg.msg );
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
Channel.prototype.info = function(msg) {
	this.addMessage( { ts: (new Date()).getTime(), cmd: 'info', detail: msg } );
}
