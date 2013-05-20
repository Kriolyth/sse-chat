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
		this.emit( 'join channel' );
		if ( this.channels.length == 1 )
			this.emit( 'channel switch', ch );
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
		this.emit( 'join channel' );
		if ( this.channels.length == 1 )
			this.emit( 'channel switch', ch );
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
	
	this.onSysMessage = function( msg ) {
		var ch = this.channels[ msg.channel ];
		if ( ch === undefined ) return;
		
		switch( msg.command ) {
			case 'enter':
			case 'exit':
			case 'info':
				ch[ msg.command ]( msg );
				this.emit( 'chat message', ch );
				break;
			default:
				console.log( 'Unknown channel message: ' + JSON.stringify( msg ) );
		}
	}
	
	this.onUserMessage = function( msg ) {
		var ch = this.channels[ msg.channel ];
		if ( ch === undefined ) return;

		if ( msg['uid'] && msg.uid == this.chatSession.userId )
			msg.ownmsg = true;
		if ( msg['guest'] )
			msg.guestmsg = true;
		ch.addMessage( msg );
		this.emit( 'chat message', ch );
	}
	
	this.processor = new Processor();
	this.processor.userMsg = this.onUserMessage;
	this.processor.sysMsg = this.onSysMessage;
	this.processor.serviceMsg = this.onSrvMessage;
	
}