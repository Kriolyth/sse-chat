var Settings = new function(){
	this.user = 0;
	this.name = '';
	this.prefix = 'ambichat_';

	this.load = function() {
		var user = localStorage.getItem( this.prefix + 'id' );
		var name = localStorage.getItem( this.prefix + 'name' );
		if ( name && name != '' && user && user != '' ) {
			this.user = parseInt( user );
			this.name = name;
		}
	}

	this.save = function() {
		if ( this.name != '' && this.user != 0 ) {
			localStorage.setItem( this.prefix + 'id',   this.user );
			localStorage.setItem( this.prefix + 'name', this.name );
		}
	}

	this.reset = function() {
		localStorage.clear();
	}
	
};