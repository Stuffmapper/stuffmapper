var bcrypt = require('bcrypt');
var pg = require('pg');
var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper2';

var braintree = require("braintree");

var gateway = braintree.connect({
	environment: braintree.Environment.Production,
	merchantId: "7t82byzdjdbkwp8m",
	publicKey: "5hnt7srpm7x5d2qp",
	privateKey: "6f8520869e0dd6bf8eec2956752166d9"
});

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
			else if(login.google) loginType = 'google';
			else if(login.facebook) loginType = 'facebook';
			var client = new pg.Client(conString);
			client.connect(function(err) {
				if(err) {
					client.end();
					return cb('pg connect error: ' + err, null);
				}
				var query = 'SELECT * FROM users WHERE '+loginType+' = $1 AND verified_email = true';
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
						if(!rows[type+'_id']) {
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

						gateway.clientToken.generate({}, function (err, response) {
							console.log(err);
							var query = [
								'INSERT INTO users',
								'(fname, lname, uname, email, '+type+'_id, braintree_token)',
								'VALUES ($1, $2, $3, $4, $5, $6)',
								'RETURNING *'
							].join(' ');
							var adjectives = ['friendly','amicable','emotional','strategic','informational','formative','formal','sweet','spicy','sour','bitter','determined','committed','wide','narrow','deep','profound','amusing','sunny','cloudy','windy','breezy','organic','incomparable','healthy','understanding','reasonable','rational','lazy','energetic','exceptional','sleepy','relaxing','delicious','fragrant','fun','marvelous','enchanted','magical','hot','cold','rough','smooth','wet','dry','super','polite','cheerful','exuberant','spectacular','intelligent','witty','soaked','beautiful','handsome','oldschool','metallic','enlightened','lucky','historic','grand','polished','speedy','realistic','inspirational','dusty','happy','fuzzy','crunchy'];
							var nouns = ['toaster','couch','sofa','chair','shirt','microwave','fridge','iron','pants','jacket','skis','snowboard','spoon','plate','bowl','television','monitor','wood','bricks','silverware','desk','bicycle','book','broom','mop','dustpan','painting','videogame','fan','baseball','basketball','soccerball','football','tile','pillow','blanket','towel','belt','shoes','socks','hat','rug','doormat','tires','metal','rocks','oven','washer','dryer','sunglasses','textbooks','fishbowl'];
							var number = Math.floor(Math.random() * 9999) + 1;

							function capitalizeFirstLetter(string) {
								return string.charAt(0).toUpperCase() + string.slice(1);
							}

							var values = [
								profile.name.givenName,
								profile.name.familyName,
								capitalizeFirstLetter(adjectives[Math.floor(Math.random() * adjectives.length)]) + capitalizeFirstLetter(nouns[Math.floor(Math.random() * nouns.length)]) + number,
								profile.email || profile.emails[0].value,
								profile.id,
								response.clientToken
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
