/*  
	Processor
	Transforms message into DOM nodes
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

	function linebreakSplit( currentNode ) {
		var text = currentNode.nodeValue;
		var chunks = text.split( '\n' );
		if ( chunks.length <= 1 ) 
			return;
		currentNode.nodeValue = chunks[0];
		var parentNode = currentNode.parentNode;
		var nextNode = currentNode.nextSibling;
		for ( var i = 1; i < chunks.length; ++i ) {
			parentNode.insertBefore( document.createElement( 'br' ), nextNode );
			parentNode.insertBefore( document.createTextNode( chunks[i] ), nextNode );
		}
	}

	// process text nodes within node and insert line breaks
	var currentNode, nextNode;
	currentNode = node.firstChild;
	nextNode = currentNode.nextSibling;
	while ( currentNode != null ) {
		if ( currentNode.nodeType == Node.TEXT_NODE ) {
			var text = currentNode.nodeValue;
			var paragraphRegex = /\n[\s\n]+/g;
			var paragraphChunks = text.split( paragraphRegex );
			if ( paragraphChunks.length > 1 ) {
				for ( var pChunk = 0; pChunk < paragraphChunks.length; ++pChunk ) {
					// create a node for each paragraph
					var pNode = document.createElement( 'p' );
					var textNode = document.createTextNode( paragraphChunks[ pChunk ] );
					pNode.appendChild( textNode );
					linebreakSplit( textNode );
					
					node.insertBefore( pNode, nextNode );
				}
				// remove current text node, because it is replaced with paragraphs
				node.removeChild( currentNode );
			} else {
				// no paragraphs, text only
				linebreakSplit( currentNode );
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
	// iterate over node children
	while ( currentNode != null ) {
		if ( currentNode.nodeType == Node.TEXT_NODE ) {
			var text = currentNode.nodeValue;
			var urlRegex =/(\b\w+:\/\/[-\w\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF+&@#\/%?=~_|!:,.;\(\)]+)/ig;  
			chunks = text.split( urlRegex );
			currentNode.nodeValue = chunks[0];
			for ( var i = 1; i < chunks.length; ++i ) {
				if ( urlRegex.test( chunks[i] ) ) {
					var linkNode = document.createElement( 'a' );
					var linkText = decodeURIComponent((chunks[i]+'').replace(/\+/g, '%20'));
					linkNode.appendChild( document.createTextNode( linkText ) );
					linkNode.setAttribute( 'href', chunks[i] );
					linkNode.setAttribute( 'target', '_blank' );
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
	
	return node;
}

TextProcessor.prototype.linkifyInvite = function( node ) {
	// process text nodes within node and insert invite links where appropriate
	var currentNode, nextNode;
	currentNode = node.firstChild;
	nextNode = currentNode.nextSibling;
	// iterate over node children
	while ( currentNode != null ) {
		if ( currentNode.nodeType == Node.TEXT_NODE ) {
			var text = currentNode.nodeValue;
			var urlRegex =/(\binvite:\/\/[A-Za-z0-9\-~]{8})/ig;  
			chunks = text.split( urlRegex );
			currentNode.nodeValue = chunks[0];
			for ( var i = 1; i < chunks.length; ++i ) {
				if ( urlRegex.test( chunks[i] ) ) {
					var linkNode = document.createElement( 'a' );
					var linkHref = document.URL + '?i=' + 
						chunks[i].substring( String('invite://'.length) );
					linkNode.appendChild( document.createTextNode( chunks[i] ) );
					linkNode.setAttribute( 'href', linkHref );
					linkNode.setAttribute( 'target', '_blank' );

					// Click handler for internal usage, so it would not open a new window,
					// but rather open a new channel tab
					linkNode.addEventListener( 'click', 
						function(){ alert( 'This feature is still in progress :)' ); 
							return false; 
						} );
					
					node.insertBefore( linkNode, nextNode );
				} else {
					node.insertBefore( document.createTextNode( chunks[i] ), nextNode );
				}
			}
		} else if ( currentNode.nodeType == Node.ELEMENT_NODE ) {
			if ( currentNode.hasChildNodes() )
				TextProcessor.prototype.linkifyInvite( currentNode );
		}
		
		currentNode = nextNode;
		if ( currentNode ) {
			nextNode = currentNode.nextSibling;
		}
	}
	
	return node;
}


TextProcessor.prototype.formatTime = function( then, now ) {
	var tsText;
	if ( now === undefined )
		now = new Date();
	var timeDiff = Math.abs( now - then );
	var dayDiff = now.getDay() - then.getDay();
	if ( timeDiff > 86400*1000 || dayDiff != 0 ) {
		// different day
		if ( timeDiff < 2*86400*1000 ) {
			if ( dayDiff == 1 ) tsText = then.format( 'вчера, HH:MM' );
			else if ( dayDiff == -1 ) tsText = then.format( 'завтра, HH:MM' );
			else tsText = then.format( 'd mmm HH:MM' );
		} else {
			// some time ago
			tsText = then.format( 'd mmm HH:MM' );			
		}
	} else {
		// same day
		tsText = then.format( 'HH:MM' );
	}
	return tsText;
}

textProcessor = new TextProcessor();
textProcessor.add( TextProcessor.prototype.linebreak );
textProcessor.add( TextProcessor.prototype.linkify );
textProcessor.add( TextProcessor.prototype.linkifyInvite );
