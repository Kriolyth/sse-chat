function Controller() {
	this.chatSession = { id: 0, userId: 0, name: '' };
	this.channels = [];
	this.listener = null;
	this.events = new EventEmitter();
	this.activeChan = null;
}

Controller.prototype.switchChannel = function( id ) {
	if ( this.channels[id] !== undefined ) {
		this.activeChan = id;
		
		events.emit( 'channel switch', channels[id] );
	}
}

Controller.prototype.on = function( event, callback, tag ) {
	this.events.addListener( event, callback, tag );
}

Controller.prototype.post = function( url, msg_object, status_cb ) {
	var xhr = new XMLHttpRequest();
	xhr.open( 'POST', server_host + url, true );
	xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
	xhr.onreadystatechange = function () {
		if ( xhr.readyState === 4 ) {
			if ( status_cb !== undefined )
				status_cb( xhr.status, msg_object );
			console.info( xhr.statusText + ' ' + xhr.responseText );
		}
	};
	// Message text is sent in POST body
	xhr.send( encodeObject( msg_object ) );
}

Controller.prototype.sendMessage( channel, msg ) {
	var msg_object = { id: this.chatSession.id, chan: channel, msg: msg };
	this.post( 'message/', msg_object );
}

Controller.prototype.authSuccess( response ) {
	if ( !response['session'] ) return;
	this.chatSession.id = response.session;
	this.chatSession.userId = response.userId;
	this.chatSession.name = response.username;
	this.emit( 'auth ok', this.chatSession );
	
	ui.init();
	
	// this might be a bit wrong; we may have a need for separate
	// "logon" ui
	ui.switchPanel( 'chat' );

	this.processor = new Processor();
	this.listener = new Listener( this.processor );
	
	controller_extend_protocol.call( this );
	
	// Only start listener after we authorized and set
	this.listener.listen( server_host + 'session?id=' + this.chatSession.id );
	
	// add offscreen message processing
	ui.offscreenHandler = OffscreenMsgHandler( ui );

}

function encodeObject(data) {
	if(!data) return false;
	var pairs = [],
		regexp = /%20/g;

	for(var name in data) {
		var value = data[name].toString(),
		pair = encodeURIComponent(name).replace(regexp, '+') + '=' + encodeURIComponent(value).replace(regexp, '+');

		pairs.push(pair);
	}

	return pairs.join('&');
}
function convertFormToObject( form ) {
	var obj = {};
	for ( var i in form.elements ) {
		if ( form.elements[i]['name'] !== undefined && form.elements[i].name != '' )
			obj[ form.elements[i].name ] = form.elements[i].value;
	}
	return obj;
}

var controller = new Controller();