function new_id() {
	 return Math.floor( Math.random() * 1677214 ) + 2;
}

function deleter( arr ) {
	return function( obj ) { delete arr[obj]; };
}

exports.new_id = new_id;
exports.deleter = deleter;