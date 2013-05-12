/*
	User Commands
	
	Captures user commands and processes them
*/

var cmd_files = [ 'pin', 'createChannel', 'leaveChannel',
	'createInvite' ];

function UserCmdHandler( msgrouter, cmdrouter ) {

	function makeHandler( cmd_object ) {
		if ( cmd_object[ 'type' ] === undefined || cmd_object.type == 'msg' ) {
			msgrouter.addHandler( cmd_object.filter, cmd_object.func );
		} else {
			cmdrouter.addHandler( cmd_object.filter, cmd_object.func );
		}
	}

	// on creation actions
	cmd_files.forEach( function _makeHandler( file ){
			var handlers = require( './usercmd/' + file + '.js' ).Cmd;
			handlers.forEach( makeHandler );
			require('util').puts( 'UserCmd: loaded ' + file + ' (' + handlers.length + ' handlers)' );
		} );
	
	
	// public interface
	return {
		// maybe some administrator settings interface6
	}

};

exports.UserCmdHandler = UserCmdHandler;