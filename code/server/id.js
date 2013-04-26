/*
	ID helper class
*/

/*
	To quote section 2.3 of RFC 3986:

	"Characters that are allowed in a URI but do not have a reserved purpose are called unreserved. 
	These include uppercase and lowercase letters, decimal digits, hyphen, period, underscore, and tilde."

*/
var key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~0123456789';

var ID = (function(){
		return {
			newid: function() {
				return Math.floor( Math.random() * 16776214 ) + 1001;
			},
			
			// return an url-friendly ID
			id2s: function( id ) {
				return '' + 
					key[ id       & 0x3f ] + 
					key[ (id>>6)  & 0x3f ] +
					key[ (id>>12) & 0x3f ] +
					key[ (id>>18) & 0x3f ];
			},
			
			// convert url-friendly string to ID
			s2id: function( s ) {
				if ( s.length != 4 ) return 0;
				var idx = [ key.indexOf(s[0]), key.indexOf(s[1]),
					key.indexOf(s[2]), key.indexOf(s[3]) ];
				if ( idx.indexOf(-1) != -1 )
					return 0;
					
				return 0 |
					( idx[0]       ) | 
					( idx[1] <<  6 ) | 
					( idx[2] << 12 ) |
					( idx[3] << 18 );
			}
		};
	})();
var ID8 = (function(){
		return {
			// return an url-friendly ID
			newid: function() {
				var chars03 = Math.floor( Math.random() * (1<<24) ) >>> 0;
				var chars47 = Math.floor( Math.random() * (1<<24) ) >>> 0;
				return ID.id2s( chars03 ) + ID.id2s( chars47 );
			}
		};
	})();

exports.ID = ID;
exports.ID8 = ID8;