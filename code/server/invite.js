/*
	Invite
	
	Invite management - all possible commands, broadcast etc.
*/

var Filter = require( './filter.js' ).Filter;

function Invite( options ) {
	this.expired = 0;
	this.invite_type = Invite.prototype.TY_INVITE;
	this.target_type = Invite.prototype.TG_CHAN;
	this.target_id = '';
	this.use_count = 0;
	this.use_limit = 0;
	this.expire_date = 0;
	this.invalid_before = 0;
	
	for ( var i in options ) {
		this[i] = options[i];
	}
}
Invite.prototype.TY_INVITE = 'invite';
Invite.prototype.TY_LINK = 'permalink';

Invite.prototype.TG_CHAN = 'channel';

Invite.prototype.ER_INVALID = 'Invitation is not valid';

Invite.prototype.isExpired = function() {
	return ( this.use_limit && this.use_count > this.use_limit ) &&
		( this.expire_date && ( (new Date()).getTime() ) > this.expire_date );
}
Invite.prototype.isInvalid = function() {
	return ( this.invalid_before && ( (new Date()).getTime() ) < this.invalid_before ) 
		|| this.isExpired();
}

Invite.prototype.use = function() {
	if ( this.isInvalid() )
		return false;
	++this.use_count;
	this.expired = this.isExpired() ? 1 : 0;
	return true;
}

Invite.prototype.url = function() {
	return 'invite://' + this.id;
}

exports.Invite = Invite;