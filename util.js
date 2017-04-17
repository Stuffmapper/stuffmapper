var pg = require('pg');
var pgconfig = {
	user: 'stuffmapper',
	database: 'stuffmapper1',
	password: 'SuperSecretPassword1!',
	host: 'localhost',
	port: 5432,
	max: 10,
	idleTimeoutMillis: 5000
};
module.exports = {
	db: function() {
		return {
			setEvent: function(level, message, user_id, post_id, cb) {
				if(typeof post_id === 'function') cb = post_id;
				var pool = new pg.Pool(pgconfig);
				pool.connect(function(err, client, done) {
					var partialQ = post_id?'(level, message, user_id1, post_id) VALUES ($1, $2, $3, $4)':'(level, message, user_id1) VALUES ($1, $2, $3)';
					var val = post_id?[level, message, user_id, post_id]:[level, message, user_id];
					client.query('INSERT INTO event '+partialQ, val, function(err, res) {done();});
				});
			}
		};
	}
};
