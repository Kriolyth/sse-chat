/*
	Channel
	
	Channel management - all possible commands, broadcast etc.
*/

var Filter = require( './filter.js' ).Filter;

var Roles = ['guest','voice','moderator','host'];

function Channel( id ) {
	this.id = id;
	this.users = {};
	this.isPublic = 0;
	this.title = 'Default title';
	this.name = '* ' + id + ' *';
	this.history = [];
}
Channel.prototype.EV_MSG = 'msg';
Channel.prototype.EV_JOIN = 'join';
Channel.prototype.EV_LEAVE = 'leave';
Channel.prototype.EV_TOPIC = 'topic';

Channel.prototype.addUser = function( user, role ) {
	if ( !this.hasUser( user ) ) {
		this.users[ user.id ] = 'guest';
	} else {
		return false;
	}
	
	if ( Roles.indexOf( role ) != -1 ) {	
		this.setUserRole( user, role );
	}
	
	return true;
}

Channel.prototype.delUser = function( user ) {
	delete this.users[ user.id ];
}

Channel.prototype.setUserRole = function( user, role ) {
	if ( this.hasUser( user ) && Roles.indexOf( role ) != -1 )
		this.users[ user.id ] = Roles.indexOf( role );
}
Channel.prototype.getUserRole = function( user ) {
	if ( this.hasUser( user ) )
		return this.users[ user.id ];
	
	return '';
}

Channel.prototype.hasUser = function( user ) {
	return ( this.users[ user.id ] !== undefined );
}

Channel.prototype.userList = function() {
	var list = Object.keys( this.users ).map( function(x){ return parseInt(x); } );
	
	return list;
}

Channel.prototype.topic = function (new_topic) {
	var result = this.title;
	if ( new_topic !== undefined && new_topic.trim() == '' )
		this.title = new_topic;
	return result;
}
Channel.prototype.serialize = function() {
	return { 
		id: this.id,
		name: this.name,
		title: this.title
	};
}

Channel.prototype.addMessage = function( event, data ) {
	var entry = {};
	switch( event ) {
		case Channel.prototype.EV_JOIN:
		case Channel.prototype.EV_LEAVE:
			entry.user = data.user;
			entry.msg = data.msg;
			break;
		case Channel.prototype.EV_MSG:
			entry.msg = data;
			break;
		default:
			entry.msg = data.msg;
	}
	entry.event = event;
	if ( data['ts'] === undefined )
		entry.ts = ( new Date() ).getTime();
	else
		entry.ts = data.ts;

	//require('util').puts( 'Event: ' + event + ', ' + JSON.stringify( entry ) );
	this.history.push( entry );
}
Channel.prototype.getHistory = function( user, limits ) {
	var lastIdx = this.history.length;
	if ( lastIdx == 0 ) 
		return [];
	--lastIdx;
	
	if ( limits[ 'first' ] === undefined )
		limits[ 'first' ] = 0;
	if ( limits[ 'last' ] === undefined )
		limits[ 'last' ] = ( new Date() ).getTime();
	
	// Things are easy if channel is public
	// They get tough when we need to rack, whether a user
	// was present at the moment
	var isUserPresent = ( this.isPublic || this.hasUser( user ) );
	var result = [];
	
	while ( lastIdx >= 0 ) {
		var entry = this.history[ lastIdx ];
		require('util').puts( entry.msg.serialize() );
		switch ( entry[ 'event' ] ) {
			case Channel.prototype.EV_LEAVE:
				if ( entry.user == user.id ) {
					// we're traversing backwards, so if someone has left/was kicked,
					// it means that the user was there before
					isUserPresent = true;
					// TODO: we need to transform these messages to something not causing
					// the event to happen
					//result.push( entry.msg );
				}
				break;
			case Channel.prototype.EV_JOIN:
				if ( entry.user == user.id ) {
					isUserPresent = this.isPublic;
					// TODO: we need to transform these messages to something not causing
					// the event to happen
					//result.push( entry.msg );
				}
				break;
			default:
				// add any message to history if we're there
				if ( limits.first <= entry.ts && entry.ts <= limits.last && isUserPresent ) {
					result.push( entry.msg );
				}
		}
		
		--lastIdx;
		if ( result.length >= limits.count )
			break;
	}
	
	return result;
}



exports.Channel = Channel;