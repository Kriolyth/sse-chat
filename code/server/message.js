/*
	Message types
	
	Just the messages se'd send over the net.
	The most important thing they differ is the serialization func.
*/

function KeepAliveMsg() {
}
KeepAliveMsg.prototype.serialize = function() {
	return ':\n\n';
}

function UserMsg( channel, from, msg ) {
	var ts = (new Data()).getTime();
	this.id = ts;
	this.channel = channel.name;
	this.ts = ts;
	this.user = from.name;
	this.msg = msg;
}
UserMsg.prototype.serialize = function() {
	return 'id: ' + this.id + 
		'\nevent: ' + this.channel +
		'\ndata: ' + JSON.toString( { 
			ts: this.ts,
			user: this.user,
			msg: this.msg 
		} ) + '\n\n';	
}

function HistoryMsg( channel, from, msg, timestamp ) {
	this.channel = channel;
	this.ts = timestamp;
	this.user = from;
	this.msg = msg;
}
HistoryMsg.prototype.serialize = function() {
	return 'event: ' + this.channel +
		'\ndata: ' + JSON.toString( { 
			ts: this.ts,
			user: this.user,
			msg: this.msg 
		} ) + '\n\n';	
}

function SysMsg( channel, command, msg ) {
	this.channel = channel;
	this.command = command;
	this.msg = ( msg ? msg : '' );
}
SysMsg.prototype.serialize = function() {
	return 'event: ' + this.channel +
		'\ndata: ' + JSON.toString( { 
			cmd: this.command,
			msg: this.msg 
		} ) + '\n\n';	
}


exports.KeepAliveMsg = KeepAliveMsg;
exports.UserMsg = UserMsg;
exports.HistoryMsg = HistoryMsg;
exports.SysMsg = SysMsg;