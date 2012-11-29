/*
	Filter object
	
	Finds something like itself in an array

	A filter is an object with field names equal to tested request fields.
	If filter field value is a string, it is tested for equality to appropriate request field.
	If filter field value is an object, it is considered a substring or regex (if 'regex' field is non-zero)
	
	E.g.:
	filter = {
		method: 'POST',    // equality
		url   : { regex: '^/post' }  // regex
		query : { match: '/post?' }  // first-letter substring
	}
	
	Usage:
	
	Filter( {...} ).match( object )  -- test an object to match the filter
	Filter( {...} ).find( array )    -- find first matching object in array
	Filter( {...} ).all( array, [callback] )  -- find all those objects in array that match

*/
function Comparator( reference, cmpFunc ) {
	this.reference = reference;
	this.match = this[ '_' + cmpFunc ];	
}

Comparator.prototype._equal = function( x ) {
	return x == this.reference;
}
Comparator.prototype._match = function( x ) {
	return ( 0 == x.indexOf( this.reference ) );
}
Comparator.prototype._regex = function( x ) {
	return this.reference.test( x );
}
Comparator.prototype._false = function( x ) {
	return false;
}


function Filter( pattern ) {
	this.filter = {};
	// convert all fields in filter to comparators
	for ( var field in pattern ) {
		switch( typeof( pattern[field] ) ) {
			case 'string': 
			case 'number': 
				this.filter[field] = new Comparator( pattern[field], 'equal' );
				break;
			case 'object':
				if ( pattern[field].regex )
					this.filter[field] = new Comparator( new RegExp( pattern[field].regex ), 'regex' );
				else if ( pattern[field].match )
					this.filter[field] = new Comparator( pattern[field].match, 'match' );
				else
					// TODO: convert to deep object comparator
					this.filter[field] = new Comparator( pattern[field], 'equal' );
				break;
			default:
				this.filter[field] = new Comparator( pattern[field], 'false' );
		}
	}
}
Filter.prototype.match = function( object ) {
	for ( var field in this.filter ) {
		// require('util').puts( 'match: field=' + field + ', objfield=' + object[field] );
		if ( object[field] && !this.filter[field].match( object[field] ) )
			return false;
	}
	return true;
}
Filter.prototype.find = function( array ) {	
	for ( var i in array ) {
		if ( this.match( array[i] ) )
			return array[i];
	}	
	return undefined;
}
Filter.prototype.all = function( array, callback ) {	
	var result = [];
	for ( var i in array ) {
		if ( this.match( array[i] ) ) {
			if ( !callback || callback( array[i] ) )
				result.push( array[i] );
		}
	}	
	return result;
}

exports.Filter = Filter;