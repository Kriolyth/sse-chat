function OffscreenMsgHandler( ui ) {
	var msg_counter = 0;
	var is_inactive = false;
	
	function visibilityChange() {
		if ( !( document.hidden || is_inactive ) ) {
			ui.amendTitle( '' );
			msg_counter = 0;
		} else {
			if ( 0 == msg_counter )
				ui.amendTitle( ' ' );
			else
				ui.amendTitle( '(' + msg_counter + ')' );
		}
	}
	
	function onFocus() {
		is_inactive = false;
		visibilityChange();
	}
	function onBlur() {
		is_inactive = true;
		visibilityChange();
	}

	function onNewMessage( to_channel ) {
		if ( ( document.hidden || is_inactive ) && 
			to_channel.id == ui.activeTabId() ) {
			++msg_counter;
			visibilityChange();
		}
	}
	
	window.addEventListener( 'blur', onBlur );
	window.addEventListener( 'focus', onFocus );
	document.addEventListener( 'visibilitychange', visibilityChange );
	controller.on( 'chat message', onNewMessage, 'offscreen' );

	return {
	}
}

function UI() {
	// UI wrapper	
	// Requires global: controller
	
	var defaultTitle;
	var activeTab = null;
	
	function updateTabs() {
		var tabsNode = document.getElementById( 'tabs' );
		var hasTabs = [];
		for ( var node = tabsNode.firstChild; node != null; node = node.nextSibling ) {
			// enlist all tabls
			if ( node.dataset && node.dataset.channelId )
				hasTabs.push( node.dataset.channelId );
		}
		
		for ( var i in controller.channels ) {
			var ch = controller.channels[ i ];
			var currentIdx = hasTabs.indexOf( ch.id );
			if ( currentIdx >= 0 ) {
				hasTabs.splice( currentIdx, 1 );
				continue;
			}
			
			var newTab = document.createElement( 'label' );
			newTab.setAttribute( 'class', 'btn' );
			newTab.setAttribute( 'id', 'chantab_' + ch.id );
			newTab.dataset.channelId = ch.id;
			// <input type="radio" name="channel">
			var opt = document.createElement( 'input' );
			opt.setAttribute( 'name', 'channel' );
			opt.setAttribute( 'type', 'radio' );
			opt.setAttribute( 'value', ch.id );
			newTab.appendChild( opt );
			var spanNode = document.createElement( 'span' );
			spanNode.appendChild( document.createTextNode( ch.name ) );
			newTab.appendChild( spanNode );
			
			opt.addEventListener( 'change', ( function _TabClickClosure(id){ 
				return function _TabClick(){ 
					controller.switchChannel(id); 
					return false; 
				} }
			)( ch.id ) );
			
			if ( !tabsNode.hasChildNodes() )
				tabsNode.appendChild( newTab );
			else
				tabsNode.insertBefore( newTab, document.getElementById( 'newchan' ) );
		}
		
		// Remove all tabs that were not found in the updated list
		for ( var i in hasTabs ) {
			var el = document.getElementById( 'chantab_' + hasTabs[i] );
			if ( el && el.parentNode )
				el.parentNode.removeChild( el );
		}
		
		var tabGrpNode = document.getElementById( 'tab-group' );
		document.getElementById( 'msgs' ).style.top = tabGrpNode.offsetHeight + 'px';
	}

	function scrollToLastMessage() {
		if ( activeTab !== undefined && controller.channels[ activeTab ] !== undefined ) {
			var objDiv = controller.channels[ activeTab ].containerNode.lastChild;
			window.scrollTo( window.scrollX, objDiv.offsetTop );
		}
	}
	
	function onChannelSwitch( to_channel ) {
		if ( activeTab == to_channel.id ) 
			return;
		
		activeTab = to_channel.id;
		var el = document.getElementById( 'tab-group' );
		if ( el && el.elements['tabs'] && el.elements.tabs.elements['channel'] ) {
			setTimeout( function(){ document.getElementById( 'tab-group' ).elements.tabs.elements[0].click(); }, 0 );
		}
			
		var el = document.getElementById( 'msgs' );		
		if ( el.hasChildNodes() )
			el.removeChild( el.firstChild );
		el.appendChild( ch.containerNode );
	}
	
	function onNewMessage( to_channel ) {
		if ( activeTab == to_channel.id )
			scrollToLastMessage();
	}
	
	function sendTextMessage() {
		if ( !activeTab ) return;
		var msg_el = document.getElementById( 'message' );
		if ( !msg_el ) return;
		var message = (new String( msg_el.value)).trim();
		if ( !message ) return;
		
		controller.sendMsg( activeTab, message );
		
		document.getElementById( 'message' ).value = '';
		return;
	};
	
	function submitAddChannel() {
		var form = document.getElementById( 'tab-group' );
		var formData = convertFormToObject( form );
		controller.sendAddChannel( name, function _AddChanCmdCallback(status,cmd) {
				switch( status ) {
					case 204:
						document.getElementById( 'newtabchk' ).checked = false;
						break;
				}
			}
		);
	}
	
	return {
		init: function() {
			defaultTitle = document.title;
			controller.on( 'channel switch', onChannelSwitch, 'ui' );
			controller.on( 'chat message', onNewMessage, 'ui' );
			controller.on( 'join channel', updateTabs, 'ui' );
			//controller.on( 'leave channel', updateTabs, 'ui' );
			
			document.getElementById( 'sendMsgBtn' ).onClick = function _btnSendMsgClick(){ 
				sendTextMessage();
				return false;
			};
			document.getElementById( 'submitAddChannel' ).onClick = function _btnAddChanClick(){ 
				submitAddChannel();
				return false;
			};
			
			document.getElementById('message').onkeypress = function _SendMsg(event) {
				// send with "Enter", newline with "Shift+Enter"
				if ( event.keyCode == 10 || ( event.keyCode == 13 && !event.ctrlKey && !event.shiftKey ) ) { 
					sendTextMessage();
					return false;
				}
				return true;
			};
		},
		
		show: function() {
			document.getElementById( 'chat' ).style.visibility = 'visible';
			document.getElementById( 'tab-group' ).style.visibility = 'visible';
		},
		hide: function() {
			document.getElementById( 'chat' ).style.visibility = 'hidden';
			document.getElementById( 'tab-group' ).style.visibility = 'hidden';
		},
		
		updateChannelTabs: function() {
			updateTabs();	
		},
		
		activeTabId: function() {
			return activeTab;
		},
		
		amendTitle: function( prefix, suffix == '' ) {
			document.title = ( prefix != '' ? prefix + ' | ' : '' ) + 
				defaultTitle +
				( sufix != '' ? ' | ' + suffix : '' );
		},
		
		switchPanel: function( panel ) {
			switch( panel ) {
				case 'chat':
					show();
					document.getElementById( 'login' ).style.visibility = 'hidden';
					break;
				case 'login':
					hide();
					document.getElementById( 'login' ).style.visibility = 'visible';
					break;
			}
		}
		
		
		
	};
};

var ui = UI();