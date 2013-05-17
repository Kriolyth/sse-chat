function Controller() {
	this.channels = [];
	this.listener = null;
	this.events = new EventEmitter();
	this.activeChan = null;
}

Controller.prototype.switchChannel = function( id ) {
	if ( channels[id] !== undefined ) {
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