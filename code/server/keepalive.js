/*
	Keep-alive timer
	
	Performs a keep-alive (callback) action every "some" time
	
	Single instance
*/

function Keeper() {
	this.curTick = 0;
	this.maxTick = 0;
	this.buckets = [];
	this.rebuild( 10 );
	
	setInterval( (function(obj){ return function(){obj.tick();} })(this), 1000 );
};
Keeper.prototype.tick = function () {	
	this.curTick = ( this.curTick + 1 ) % this.maxTick;
	
	if ( this.buckets.length < this.maxTick )
		rebuild();
	
	//require('util').puts( JSON.toString( {tick:this.curTick} ) );
	
	if ( this.buckets[ this.curTick ].length > 0 )
	{
		// Perform a keep-alive on all objects
		// If callback returns 'false', the object needs to be 
		// tracked no more
		this.buckets[ this.curTick ] = 
			this.buckets[ this.curTick ].filter( function(entry) {
				return entry.keepAlive();
			} );
	}
}
Keeper.prototype.add = function( callback ) {
	var entry = { bucket: this.curTick, keepAlive: callback };
	this.buckets[ this.curTick ].push( entry );
	
	var s = JSON.stringify( entry );
	require('util').puts( s );
	
	return entry;
}
Keeper.prototype.remove = function( entry ) {
	// we rely on auto-filter mechanism
	entry.keepAlive = function(){ return false; }
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

var KeepAlive = function () {
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
		}
	}

};

function setKeepAliveInterval( timeout ) {
	keeper.rebuild( timeout );
}

exports.KeepAlive = KeepAlive;
exports.setKeepAliveInterval = setKeepAliveInterval;