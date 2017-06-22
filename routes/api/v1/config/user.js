var bcrypt = require('bcryptjs');
var pg = require('pg');
var path = require('path');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../../config'))[stage];
var pgUser = config.db.user;
var pgDb = config.db.db;
var pgPass = config.db.pass;
var pgHost = config.db.host;
var pgPort = config.db.port;
var conString = 'postgres://'+pgUser+':'+pgPass+'@'+pgHost+':'+pgPort+'/'+pgDb;

var braintree = require("braintree");

var gateway = "";

if(stage==='production' || stage==='development') {
	gateway = braintree.connect({
		environment: braintree.Environment.Production,
		merchantId: '7t82byzdjdbkwp8m',
		publicKey: '5hnt7srpm7x5d2qp',
		privateKey: '6f8520869e0dd6bf8eec2956752166d9'
	});
}
else if(stage==='test') {
	gateway = braintree.connect({
		environment: braintree.Environment.Sandbox,
		merchantId: 'jbp33kzvs7tp3djq',
		publicKey: 'swm4xbv63c7rgt7v',
		privateKey: 'b7a045a67ae6fc5489c5cb1ac3f0797a'
	});
}

module.exports = (function() {
	function generatePassword(password) {
		var saltRounds = 10;
		bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
			// Store hash in your password DB.
		});
	}
	function validatePassword(password, hash, cb) {
		if(verifyPassword(password)) {
			return bcrypt.compare(password, hash, function(err, res) {
				cb(err, res);
			});
		} else cb('invalid password', null);
	}
	function findOne(login, cb) {
		if(login && (login.email || login.uname || login.google || login.facebook)) {
			var loginType = '';
			if(login.email) loginType = 'email';
			else if(login.uname) loginType = 'uname';
			//else if(login.google) loginType = 'google_id';
			//else if(login.facebook) loginType = 'facebook_id';
			var client = new pg.Client(conString);
			client.connect(function(err) {
				if(err) {
					client.end();
					return cb('pg connect error: ' + err, null);
				}
				var query = 'SELECT * FROM users WHERE '+loginType+' = $1';
				var values = [login[loginType].toLowerCase()];
				client.query(query, values, function(err, result) {
					client.end();
					if(err) {
						client.end();
						return cb('pg query error: ' + err, null);
					}
					var row = result.rows[0];
					if(!row) return cb('user not found');
					else if(row.google_id) return cb('Click the Google button to log in!');
					else if(row.facebook_id) return cb('Click the Facebook button to log in!');
					else if(!row.verified_email) return cb('please verify your email address');
					else if(!row.password) return cb('<a href="/api/v1/account/resetpassword">forgot your password?</a>');
					return cb(null, row);
					/*var query = 'update users set last_sign_in = now() WHERE '+loginType+' = $1';
					var values = login.email || login.uname;
					client.query(query, [values], function(err, result) {
						row = result.rows[0] || row;
						return cb(null, row);
					});*/
				});
			});
		}
		else cb('Invalid login type', null);
	}
	function findOrCreateOne(type, profile, req, cb) {
		var client = new pg.Client(conString);
		if(profile) {
			client.connect(function(err) {
				if(err) {
					client.end();
					return cb(err, null);
				}
				var email = profile.email || profile.emails[0].value;
				email = email.toLowerCase();
				if (req.session.passport && req.session.passport.user) {
					console.log("With session");
					var query = 'SELECT * FROM users WHERE '+type+'_id = $1';
					var values = [ profile.id ];
					client.query(query, values, function (err, result) {
						if(!result.rows.length) {
								query = 'UPDATE users SET ' + type + '_id = $1, ' + type + '_email = $2  where id = $3 RETURNING *';
								values = [ profile.id, email, req.session.passport.user.id ];
								client.query(query, values, function (err, result) {
									client.end();
									if (err) return cb(err, null);
									return cb(null, result.rows[0]);
								});
						} else {
							client.end();
							return cb("This "+ type+" account is already connected with another account.");
						}
					});
				} else {
					console.log("Without session");
					var query = 'SELECT * FROM users WHERE ' + type + '_id = $1';// and ' + type + '_email = $2';
					var email = profile.email || profile.emails[0].value;
					email = email.toLowerCase();
					var values = [ profile.id	];
					client.query(query, values, function (err, result) {
						console.log('1: ', err, result);
						if (result.rows.length) {
							client.end();
							return cb(null, result.rows[0]);
							/*var query = 'update users set last_sign_in = now() WHERE  ' + type + '_id = $1';
							 var values = [profile.id];
							 client.query(query, values, function(err, result) {
							 row = result.rows[0] || row;
							 return cb(null, row);
							 });*/
						} else {
							query = 'SELECT * FROM users WHERE email = $1';
							values = [ email ];
							client.query(query, values, function (err, result) {
								if (!result.rows.length) {
									gateway.clientToken.generate({}, function (err, response) {
										var query = [
											'INSERT INTO users',
											'(fname, lname, uname, ' + type + '_email, ' + type + '_id, braintree_token, email, verified_email)',
											'VALUES ($1, $2, $3, $4, $5, $6, $7)',
											'RETURNING *'
										].join(' ');
										var adjectives = ['friendly', 'amicable', 'emotional', 'strategic', 'informational', 'formative', 'formal', 'sweet', 'spicy', 'sour', 'bitter', 'determined', 'committed', 'wide', 'narrow', 'deep', 'profound', 'amusing', 'sunny', 'cloudy', 'windy', 'breezy', 'organic', 'incomparable', 'healthy', 'understanding', 'reasonable', 'rational', 'lazy', 'energetic', 'exceptional', 'sleepy', 'relaxing', 'delicious', 'fragrant', 'fun', 'marvelous', 'enchanted', 'magical', 'hot', 'cold', 'rough', 'smooth', 'wet', 'dry', 'super', 'polite', 'cheerful', 'exuberant', 'spectacular', 'intelligent', 'witty', 'soaked', 'beautiful', 'handsome', 'oldschool', 'metallic', 'enlightened', 'lucky', 'historic', 'grand', 'polished', 'speedy', 'realistic', 'inspirational', 'dusty', 'happy', 'fuzzy', 'crunchy'];
										var nouns = ['toaster', 'couch', 'sofa', 'chair', 'shirt', 'microwave', 'fridge', 'iron', 'pants', 'jacket', 'skis', 'snowboard', 'spoon', 'plate', 'bowl', 'television', 'monitor', 'wood', 'bricks', 'silverware', 'desk', 'bicycle', 'book', 'broom', 'mop', 'dustpan', 'painting', 'videogame', 'fan', 'baseball', 'basketball', 'soccerball', 'football', 'tile', 'pillow', 'blanket', 'towel', 'belt', 'shoes', 'socks', 'hat', 'rug', 'doormat', 'tires', 'metal', 'rocks', 'oven', 'washer', 'dryer', 'sunglasses', 'textbooks', 'fishbowl'];
										var number = Math.floor(Math.random() * 9999) + 1;

										function capitalizeFirstLetter(string) {
											return string.charAt(0).toUpperCase() + string.slice(1);
										}

										var values = [
											profile.name.givenName,
											profile.name.familyName,
											capitalizeFirstLetter(adjectives[Math.floor(Math.random() * adjectives.length)]) + capitalizeFirstLetter(nouns[Math.floor(Math.random() * nouns.length)]) + number,
											email,
											profile.id,
											response.clientToken,
											email,
											true
										];
										client.query(query, values, function (err, result) {
											client.end();
											if (err) {
												return cb(err, null);
											} else {
												return cb(null, result.rows[0]);
											}
										});
									});
								} else {
									client.end();
									if (result.rows[0].password) {
										cb({
											message: 'account exists',
											type: 'standard',
											otherType: type,
											email: email
										}, null);
									}
									else if (result.rows[0].google_id) {
										cb({
											message: 'account exists',
											type: 'google',
											otherType: type,
											email: email
										}, null);
									}
									else if (result.rows[0].facebook_id) {
										cb({
											message: 'account exists',
											type: 'facebook',
											otherType: type,
											email: email
										}, null);
									}
								}
							});
						}
					});
				}
			});
		}
		else return cb('invalid user parameters', null);
	}
	function verifyPassword(password) {
		return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/.test(password);
	}
	return {
		generatePassword: generatePassword,
		validatePassword: validatePassword,
		findOne: findOne,
		findOrCreateOne: findOrCreateOne
	};
}());
