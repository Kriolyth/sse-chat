function MsgHandlers() {
	function onSrvJoinMsg( msg ) {
		var ch = channels[ msg.channel ];
		if ( ch === undefined ) {
			ch = new Channel( msg.data );
			channels[ ch.id ] = ch;
		}
		ch.join( msg );
		ui.updateChannelTabs();
		if ( active_chan == null ) {
			switchChannel( ch.id );
			var el = document.getElementById( 'tab-group' );
			if ( el && el.elements['tabs'] && el.elements.tabs.elements['channel'] ) {
				setTimeout( function(){ document.getElementById( 'tab-group' ).elements.tabs.elements[0].click(); }, 0 );
			}
		}
	}
	
	function onSrvLeaveMsg( msg ) {
		var ch = channels[ msg.channel ];
		if ( ch !== undefined )
			ch.leave();
	}
	
	function onSrvMyChanMsg( msg ) {
		var ch = channels[ msg.data.channel.id ];
		if ( ch === undefined ) {
			ch = new Channel( msg.data.channel );
			channels[ ch.id ] = ch;
		} else {
			// update channel information
			ch.name = msg.data.channel.name;
			ch.title = msg.data.channel.title;
		}
		updateChannelTabs();
		if ( active_chan == null ) {
			switchChannel( ch.id );	
			var el = document.getElementById( 'tab-group' );
			if ( el && el.elements['tabs'] && el.elements.tabs.elements['channel'] ) {
				setTimeout( function(){ document.getElementById( 'tab-group' ).elements.tabs.elements[0].click(); }, 0 );
			}
		}
	}
	
	return {
		register : function( processor ) {
			processor.setServiceHandler( 'join', onSrvJoinMsg );
			processor.setServiceHandler( 'leave', onSrvLeaveMsg );
			processor.setServiceHandler( 'mychan', onSrvMyChanMsg );
		}
	}
	
}