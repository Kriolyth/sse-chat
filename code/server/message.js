/*
	Message types
	
	Just the messages we'd send over the net.
	The most important thing they differ is the serialization func.
*/

function KeepAliveMsg() {
}
KeepAliveMsg.prototype.serialize = function() {
	return ':\n\n';
}

function UserMsg( channel, from, msg ) {
	var ts = (new Date()).getTime();
	this.id = ts;
	this.channel = channel.name;
	this.ts = ts;
	this.user = from.name;
	this.msg = msg;
}
UserMsg.prototype.serialize = function() {
	return 'id: ' + this.id + 
		'\ndata: ' + JSON.stringify( { 
			ts: this.ts,
			user: this.user,
			channel: this.channel,
			msg: this.msg
		} ) + '\n\n';	
}

function HistoryMsg( channel, from, msg, timestamp ) {
	this.channel = channel.name;
	this.ts = timestamp;
	this.user = from.name;
	this.msg = msg;
}
HistoryMsg.prototype.serialize = function() {
	return 'data: ' + JSON.stringify( { 
			ts: this.ts,
			user: this.user,
			channel: this.channel,
			msg: this.msg 
		} ) + '\n\n';	
}

function SysMsg( channel, command, msg ) {
	this.channel = channel.id;
	this.command = command;
	this.msg = ( msg ? msg : '' );
}
SysMsg.prototype.serialize = function() {
	return 'event: cmd' +
		'\ndata: ' + JSON.stringify( { 
			cmd: this.command,
			channel: this.channel,
			msg: this.msg 
		} ) + '\n\n';	
}

function ServiceMsg( msg ) {
	this.msg = ( msg ? msg : '' );
}
ServiceMsg.prototype.serialize = function() {
	return 'event: sv\ndata: ' + JSON.stringify( this.msg ) + '\n\n';	
}

exports.KeepAliveMsg = KeepAliveMsg;
exports.UserMsg = UserMsg;
exports.HistoryMsg = HistoryMsg;
exports.SysMsg = SysMsg;
exports.ServiceMsg = ServiceMsg;