/*  
	Processor
	Retrieves the message from data received by listener
*/

function Processor() { 
	this.userMsg = this.sysMsg = this.serviceMsg = function _ProcessorEmptyHandler(){};
	this.serviceHandlers = [];
	this.channelHandlers = [];
}

Processor.prototype.setServiceHandler = function( ev, f ) {
	this.serviceHandlers[ ev ] = f;
}
Processor.prototype.setChannelHandler = function( cmd, f ) {
	this.channelHandlers[ cmd ] = f;
}

Processor.prototype.handleServiceMsg = function( raw ) {
	// Detect message type and act accordingly
	if ( raw['event'] === undefined || 
		this.serviceHandlers[raw.event] === undefined ) {
		this.serviceMsg( raw );
	} else {
		this.serviceHandlers[ raw.event ]( raw );
	}
}
Processor.prototype.handleChannelMsg = function( raw ) {
	var msg = { channel: raw.channel, command: raw.cmd, data: raw.msg };
	if ( this.channelHandlers[ msg.command ] === undefined )
		this.sysMsg( msg );
	else
		this.channelHandlers[ msg.command ]( msg );
}
Processor.prototype.handleUserMsg = function( raw ) {
	if ( raw['ts'] !== undefined ) {
		this.userMsg( raw );
	} else {
		console.log( 'Unrecognized message: ' );
		console.log( raw );
	}
}