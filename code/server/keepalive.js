/*
	Keep-alive timer
	
	Performs a keep-alive (callback) action every "some" time
	
	Single instance
*/

function Keeper() {
	this.curTick = 0;
	this.maxTick = 0;
	this.buckets = [];
	this.rebuild( 15 );
	
	setInterval( (function(obj){ return function(){obj.tick();} })(this), 1000 );
};
Keeper.prototype.tick = function () {	
	this.curTick = ( this.curTick + 1 ) % this.maxTick;
	
	if ( this.buckets.length < this.maxTick )
		rebuild();
	
	//require('util').puts( JSON.stringify( {tick:this.curTick} ) );
	
	if ( this.buckets[ this.curTick ].length > 0 )
	{
		// Perform a keep-alive on all objects
		// If callback returns 'false', the object needs to be 
		// tracked no more
		this.buckets[ this.curTick ] = 
			this.buckets[ this.curTick ].filter( function(entry) {
				//if ( entry.keepAlive ) return entry.keepAlive();
				//else return false;
				return entry.keepAlive();
			} );
	}
}
Keeper.prototype.add = function( callback ) {
	var entry = { bucket: this.curTick, keepAlive: callback };
	this.buckets[ this.curTick ].push( entry );
	
	//var s = JSON.stringify( entry );
	//require('util').puts( s );
	
	return entry;
}
function KeepAliveOff() {
	return false;
}
Keeper.prototype.remove = function( entry ) {
	// we rely on auto-filter mechanism
	entry.keepAlive = KeepAliveOff;
}
Keeper.prototype.reset = function( entry ) {
	if ( entry.bucket != this.curTick ) {
		var new_entry = this.add( entry.keepAlive );
		this.remove( entry );
		return new_entry;
	} else 
		return entry;
}

// Rebuilt buckets according to new maxTick
Keeper.prototype.rebuild = function( maxTick ) {
	if ( maxTick === this.maxTick || maxTick <= 0 ) 
		return;
	if ( maxTick )
		this.maxTick = maxTick;
	
	if ( this.buckets.length < this.maxTick ) {
		// just expand
		while ( this.buckets.length < this.maxTick )
			this.buckets.push( [] );
	} else {
		// contract and 
		while ( this.buckets.length > this.maxTick ) {
			var entries = this.buckets.pop();
			var newTick = this.buckets.length % this.maxTick;
			entries.forEash( function(entry) { entry.bucket = newTick; } );
			this.buckets[ newTick ] = this.buckets[ newTick ].concat( entries );
		}
	}
	
}

var keeper = new Keeper();

function KeepAlive() {
	// private scope
	var entry;
	
	// on creation actions
	
	// public interface
	return {
		on: function( callback ) {
			entry = keeper.add( callback );
		},
		off: function() {
			keeper.remove( entry );
			entry = undefined;
		},
		reset: function() {
			// postpone keep-alive signal to next round
			if ( entry )
				entry = keeper.reset( entry );
		}
	}

};

function setKeepAliveInterval( timeout ) {
	keeper.rebuild( timeout );
}

exports.KeepAlive = KeepAlive;
exports.setKeepAliveInterval = setKeepAliveInterval;