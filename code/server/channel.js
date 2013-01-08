/*
	Channel
	
	Channel management - all possible commands, broadcast etc.
*/

var Filter = require( './filter.js' ).Filter;

var Roles = ['guest','voice','moderator','host'];

function Channel( id ) {
	this.id = id;
	this.users = {};
	this.published = 0;
	this.title = 'Default title';
	this.name = '* ' + id + ' *';
}

Channel.prototype.addUser = function( user, role ) {
	if ( !this.hasUser( user ) ) {
		this.users[ user.id ] = 'guest';
	}
	
	if ( Roles.indexOf( role ) != -1 ) {	
		this.setUserRole( user, role );
	}
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

exports.Channel = Channel;