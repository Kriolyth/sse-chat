/*
	ID helper class
*/

var ID = {
		/*
			To quote section 2.3 of RFC 3986:

			"Characters that are allowed in a URI but do not have a reserved purpose are called unreserved. 
			These include uppercase and lowercase letters, decimal digits, hyphen, period, underscore, and tilde."
		
		*/
		key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~0123456789',
		newid: function() {
			return Math.floor( Math.random() * 16776214 ) + 1001;
		}
		
		// return an url-friendly ID
		id2s: function( id ) {
			return 
				this.key[ id       & 0x3f ] + 
				this.key[ (id>>6)  & 0x3f ] +
				this.key[ (id>>12) & 0x3f ] +
				this.key[ (id>>18) & 0x3f ];
		}
	};

exports.ID = ID;