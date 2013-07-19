function controller_extend_protocol() {
	this.sendMessage = function( channel, msg, callback ) {
		var msg_object = { id: this.chatSession.id, chan: channel, msg: msg };
		this.post( 'message/', msg_object, callback );
	}
	this.sendAddChannel = function( channel_name, callback ) {
		var request_object = { id: this.chatSession.id, cmd: 'newchan', name: channel_name };
		this.post( 'cmd/', request_object, callback );
	}
	
	this.onSrvJoinMsg = function( msg ) {
		var ch = this.channels[ msg.channel ];
		if ( ch === undefined ) {
			ch = new Channel( msg.data );
			this.channels[ ch.id ] = ch;
		}
		ch.join( msg );
		this.events.emit( 'join channel' );
		if ( this.channels.length == 1 )
			this.events.emit( 'channel switch', ch );
	}
	
	this.onSrvLeaveMsg = function( msg ) {
		var ch = this.channels[ msg.channel ];
		if ( ch !== undefined )
			ch.leave();
	}
	
	this.onSrvMyChanMsg = function( msg ) {
		var ch = this.channels[ msg.data.channel.id ];
		if ( ch === undefined ) {
			ch = new Channel( msg.data.channel );
			this.channels[ ch.id ] = ch;
		} else {
			// update channel information
			ch.name = msg.data.channel.name;
			ch.title = msg.data.channel.title;
		}
		this.events.emit( 'join channel' );
		if ( this.channels.length == 1 )
			this.events.emit( 'channel switch', ch );
	}

	this.onSrvMessage = function( msg ) {
		switch( msg.event ) {
			case 'invite_result':
				if ( !msg.data.processed )
					alert( msg.data.msg );
				break;
			default:
				console.log( 'Unknown service message: ' + JSON.stringify( msg ) );
		}
	}
	
	this.onChanMsg = function( msg ) {
		var ch = this.channels[ msg.channel ];
		if ( ch === undefined ) return;
		
		// enter, exit, info
		ch[ msg.command ]( msg );
		this.events.emit( 'chat message', ch );
	}
	
	this.onSysMessage = function( msg ) {
		console.log( 'Unknown channel message: ' + JSON.stringify( msg ) );
	}
	
	this.onUserMessage = function( msg ) {
		var ch = this.channels[ msg.channel ];
		if ( ch === undefined ) return;

		if ( msg['uid'] && msg.uid == this.chatSession.userId )
			msg.ownmsg = true;
		if ( msg['guest'] )
			msg.guestmsg = true;
		ch.addMessage( msg );
		this.events.emit( 'chat message', ch );
	}

	var bind = function(obj, method){
		return (function(o){ return function(){ 
			var args = Array.prototype.slice.call( arguments );
			method.apply(o, args);
		} } )(obj);
	};
	this.processor.setServiceHandler( 'join', bind( this, this.onSrvJoinMsg ) );
	this.processor.setServiceHandler( 'leave', bind( this, this.onSrvLeaveMsg ) );
	this.processor.setServiceHandler( 'mychan', bind( this, this.onSrvMyChanMsg ) );
	this.processor.setChannelHandler( 'enter', bind( this, this.onChanMsg ) );
	this.processor.setChannelHandler( 'exit', bind( this, this.onChanMsg ) );
	this.processor.setChannelHandler( 'info', bind( this, this.onChanMsg ) );
	this.processor.userMsg = bind( this, this.onUserMessage );
	this.processor.sysMsg = bind( this, this.onSysMessage );
	this.processor.serviceMsg = bind( this, this.onSrvMessage );
	
}