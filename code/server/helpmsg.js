/*
	Help messages
	
	Standard help messages
*/

var Messages = require( './message.js' );

var welcomeMsg = 'Добро пожаловать в Уютный Чатик&tm;!';
var newPinMsg = 'Запомните ваш новый пин-код: %s';
var chanHelpMsg = 'Channel help';

function HelpMsg() {
	this.messages = {
		'welcome' : welcomeMsg,
		'new_pin' : newPinMsg,
		'chan' : chanHelpMsg
	};
};

HelpMsg.prototype.msg = function( name, channel ) {
	var msg = ( this[name] ? this[name] : ( 'no_message ' + name ) );
	
	// if there are arguments supplied, perform a call to 'format'
	if ( arguments.length > 2 )  
		msg = require('util').format.apply( undefined, msg, 
			[].slice.call(arguments).slice(2) );

	return (new Messages.SysMsg( channel, 'info', msg ) );
}

var helpMsg = HelpMsg();

exports.HelpMsg = helpMsg;