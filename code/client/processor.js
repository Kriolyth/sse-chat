/*  
	Processor
	Retrieves the message from data received by listener
*/

function Processor() { 
	this.userMsg = this.sysMsg = this.serviceMsg = function _ProcessorEmptyHandler(){};
}

Processor.prototype.handleServiceMsg = function( raw ) {
	// Detect message type and act accordingly
	this.serviceMsg( raw );
}
Processor.prototype.handleChannelMsg = function( raw ) {
	var msg = { channel: raw.channel, command: raw.cmd, data: raw.msg };
	this.sysMsg( msg );
}
Processor.prototype.handleUserMsg = function( raw ) {
	if ( raw['ts'] !== undefined ) {
		this.userMsg( raw );
	} else {
		console.log( 'Unrecognized message: ' );
		console.log( raw );
	}
}