/*  
	Processor
	Retrieves the message from data received by listener
*/

function TextProcessor() {
	this.handlers = [];
}
	
TextProcessor.prototype.process = function( node ) {
	return this.handlers.reduce( function _TextProcIterator( n, p ){ 
			return p(n); 
	}, node );
};
		
TextProcessor.prototype.add = function( handler, index ) {
	if ( undefined === index )
		this.handlers.push( handler );
	else
		this.handlers.splice( index, 0, handler );
};
		
TextProcessor.prototype.remove = function( handler ) {
	var idx = this.handlers.indexOf( handler );
	if ( idx >= 0 )
		return ( this.handlers.splice( idx, 1 ).length > 0 );
	else
		return false;
};

TextProcessor.prototype.linebreak = function( node ) {
	// process text nodes within node and insert line breaks
	var currentNode, nextNode;
	currentNode = node.firstChild;
	nextNode = currentNode.nextSibling;
	while ( currentNode != null ) {
		if ( currentNode.nodeType == Node.TEXT_NODE ) {
			var text = currentNode.nodeValue;
			var chunks = text.split( '\n' );
			currentNode.nodeValue = chunks[0];
			for ( var i = 1; i < chunks.length; ++i ) {
				node.insertBefore( document.createElement( 'br' ), nextNode );
				node.insertBefore( document.createTextNode( chunks[i] ), nextNode );
			}
		} else if ( currentNode.nodeType == Node.ELEMENT_NODE ) {
			if ( currentNode.hasChildNodes() )
				TextProcessor.prototype.linebreak( currentNode );
		}
		
		currentNode = nextNode;
		if ( currentNode ) {
			nextNode = currentNode.nextSibling;
		}
	}
	return node;
}
TextProcessor.prototype.linkify = function( node ) {
	// process text nodes within node and insert links where appropriate
	var currentNode, nextNode;
	currentNode = node.firstChild;
	nextNode = currentNode.nextSibling;
	// iterate over node siblings
	while ( currentNode != null ) {
		if ( currentNode.nodeType == Node.TEXT_NODE ) {
			var text = currentNode.nodeValue;
			var urlRegex =/(\b\w+:\/\/\b[-\w\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF+&@#\/%?=~_|!:,.;\(\)]+)/ig;  
			chunks = text.split( urlRegex );
			currentNode.nodeValue = chunks[0];
			for ( var i = 1; i < chunks.length; ++i ) {
				if ( urlRegex.test( chunks[i] ) ) {
					var linkNode = document.createElement( 'a' );
					var linkText = decodeURIComponent((chunks[i]+'').replace(/\+/g, '%20'));
					linkNode.appendChild( document.createTextNode( linkText ) );
					linkNode.setAttribute( 'href', chunks[i] );
					node.insertBefore( linkNode, nextNode );
				} else {
					node.insertBefore( document.createTextNode( chunks[i] ), nextNode );
				}
			}
		} else if ( currentNode.nodeType == Node.ELEMENT_NODE ) {
			if ( currentNode.hasChildNodes() )
				TextProcessor.prototype.linkify( currentNode );
		}
		
		currentNode = nextNode;
		if ( currentNode ) {
			nextNode = currentNode.nextSibling;
		}
	}
}

textProcessor = new TextProcessor();
textProcessor.add( TextProcessor.prototype.linebreak );
textProcessor.add( TextProcessor.prototype.linkify );