$u.tween = function() {
	return {
		thing1: 'thing1',
		thing2: function(thing) {
			return 'thing2 and ' + thing;
		}
	};
}();
