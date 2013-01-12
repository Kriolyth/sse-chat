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

TextProcessor.prototype.linkify = function( node ) {
	// process text nodes within node and insert links where appropriate
	return node;
}

textProcessor = new TextProcessor();
textProcessor.add( TextProcessor.prototype.linkify );