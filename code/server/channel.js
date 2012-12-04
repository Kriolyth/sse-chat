/*
	Channel
	
	Channel management - all possible commands, broadcast etc.
*/

var Filter = require( './filter.js' ).Filter;

var Roles = ['guest','voice','moderator','host'];

function Channel( id ) {
	this.id = id;
	this.publicicty = 0;
	this.users = [];
}

Channel.prototype.addUser( user, role ) {
	if ( !this.hasUser( user ) ) {
		this.users[ user.id ] = 'guest';
	}
	
	if ( Roles.indexOf( role ) != -1 ) {	
		this.setUserRole( user, role );
	}
}

Channel.prototype.delUser( user ) {
	delete this.users[ user.id ];
}

Channel.prototype.setUserRole( user, role ) {
	if ( this.hasUser( user ) && Roles.indexOf( role ) != -1 )
		this.users[ user.id ] = Roles.indexOf( role );
}
Channel.prototype.getUserRole( user ) {
	if ( this.hasUser( user ) )
		return this.users[ user.id ];
	
	return '';
}

Channel.prototype.hasUser( user ) {
	return ( this.users[ user.id ] !== undefined );
}

exports.Channel = Channel;