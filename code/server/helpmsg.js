/*
	Help messages
	
	Standard help messages
*/

var Messages = require( './message.js' );

var welcomeMsg = '����� ���������� � ������ �����&tm;!';
var newPinMsg = '��������� ��� ����� ���-���: %s';
var chanHelpMsg = 'Channel help';

var HelpMsg = {
	'welcome' : welcomeHelp,
	'new_pin' : newPinMsg,
	'chan' : chanHelpMsg
};

HelpMsg.prototype.msg( name, channel ) {
	var msg = ( this[name] ? this[name] : ( 'no_message ' + name ) );
	
	// if there are arguments supplied, perform a call to 'format'
	if ( arguments.length > 2 )  
		msg = require('util').format.apply( undefined, msg, 
			[].slice.call(arguments).slice(2) );

	return (new Messages.SysMsg( channel, 'info', msg ) );
}

exports.HelpMsg = HelpMsg;