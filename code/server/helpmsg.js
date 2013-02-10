/*
	Help messages
	
	Standard help messages
*/

var Messages = require( './message.js' );

var welcomeMsg = 'Добро пожаловать в Уютный Чатик™';
var newPinMsg = 'Запомните ваш новый пин-код: %s';
var cmdHelp = 'Если вы его всё-таки забудете, введите /pin для напоминания';
var chanHelpMsg = 'Channel help';

function HelpMsg() {
	this.messages = {
		'welcome' : welcomeMsg,
		'new_pin' : newPinMsg,
		'commands' : cmdHelp,
		'chan' : chanHelpMsg
	};
};

HelpMsg.prototype.msg = function( name, channel ) {
	var message = ( this.messages[name] ? this.messages[name] : ( 'no_message ' + name ) );
	
	// if there are arguments supplied, perform a call to 'format'
	if ( arguments.length > 2 ) {
		var args = Array.prototype.slice.call( arguments );
		args.splice( 0, 2, message );
		
		message = require('util').format.apply( undefined, args );
	}

	return (new Messages.ChanServMsg( channel, message ) );
}

var helpMsg = new HelpMsg();

exports.HelpMsg = helpMsg;