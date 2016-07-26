var bcrypt = require('bcrypt');
var pg = require('pg');
var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper';

module.exports = (function() {
	function generatePassword(password) {
		var saltRounds = 10;
		bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
			// Store hash in your password DB.
		});
	}
	function validatePassword(password, hash, cb) {
		return bcrypt.compare(password, hash, function(err, res) {
			cb(err, res);
		});
	}
	function findOne(login, cb) {
		if(login && (login.email || login.uname || login.google || login.facebook)) {
			var loginType = '';
			if(login.email) loginType = 'email';
			else if(login.uname) loginType = 'uname';
			else if(login.google) loginType = 'google_id';
			else if(login.facebook) loginType = 'facebook_id';
			var client = new pg.Client(conString);
			client.connect(function(err) {
				if(err) {
					client.end();
					return cb('pg connect error: ' + err, null);
				}
				var query = 'SELECT * FROM users WHERE '+loginType+' = $1';
				var values = [
					login[loginType]
				];
				client.query(query, values, function(err, result) {
					if(err) {
						client.end();
						return cb('pg query error: ' + err, null);
					}
					var row = result.rows[0];
					client.end();
					return cb(null, row);
				});
			});
		}
		else {
			cb('Invalid login type', null);
		}
	}
	function findOrCreateOne(type, profile, cb) {
		var client = new pg.Client(conString);
		if(profile) {
			client.connect(function(err) {
				if(err) {
					client.end();
					return cb(err, null);
				}
				var query = 'SELECT * FROM users WHERE '+type+'_id = $1 OR email = $2';
				var values = [
					profile.id,
					profile.email
				];
				client.query(query, values, function(err, result) {
					if(result && result.rows && result.rows.length !== 0) {
						var rows = result.rows[0];
						if(!rows[type]) {
							query = 'UPDATE users SET '+type+'_id = $1 where email = $2 RETURNING *';
							values = [
								profile.id,
								profile.email
							];
							client.query(query, values, function(err, result) {
								if(err) {
									client.end();
									return cb(err, null);
								}
								cb(null, result.rows[0]);
							});
						}
						else {
							client.end();
							return cb(null, rows);
						}
					}
					else {
						query = [
							'INSERT INTO users ',
							'(fname, lname, uname, email) ',
							'VALUES ($1, $2, $3, $4) ',
							'RETURNING *'
						].join('');
						values = [
							profile.name.givenName,
							profile.name.familyName,
							profile.displayName,
							profile.email || profile.emails[0].value
						];
						client.query(query, values, function(err, result) {
							if(err) {
								client.end();
								return cb(err, null);
							} else {
								client.end();
								return cb(null, result.rows[0]);
							}
						});
					}
				});
			});
		} else {
			return cb('invalid user parameters', null);
		}
	}
	// TODO: implement this!
	function verifyPassword(password) {
		if(/abcd/.test(password)) return true;
		else return true;
	}
	return {
		generatePassword: generatePassword,
		validatePassword: validatePassword,
		findOne: findOne,
		findOrCreateOne: findOrCreateOne
	};
}());
