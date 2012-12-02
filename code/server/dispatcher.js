/*
	Message Dispatcher
	
	Sends messages over the socket
	Actually, it is just a "sink" to push all messages to several sessions
	at one time. No special processing is here.
	
	Single instance
*/

var Dispatcher = (function () {
		// private scope
		var emitter = require( 'events' ).EventEmitter;
				
		function onPush( sessions ) {
			// send out the messages
			sessions.forEach( function(entry) { entry.send(); } );
		}
		
		// on creation actions
		emitter.on( 'push', onPush );
		
		// public interface
		return {
			queue: function( sessions ) {
				emitter.emit( 'push', sessions.slice(0) );
			}
		}

	})();
	
exports.Dispatcher = Dispatcher;