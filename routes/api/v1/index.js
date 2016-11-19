var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var fs = require('fs');
var imagemin = require('imagemin');
var imageminPngquant = require('imagemin-pngquant');
var saltRounds = 10;
var passport = require('passport');
var path = require('path');
var request = require('request');
var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper2';
var braintree = require('braintree');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../config'))[stage];
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.accessKeyId = 'AKIAJQZ2JZJQHGJV7UBQ';
AWS.config.secretAccessKey = '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';
AWS.config.region = 'us-west-2';
var s3 = new AWS.S3({Bucket:'stuffmapper-v2',region:'us-west-2'});


if(stage==='production') {
	var gateway = braintree.connect({
		environment: braintree.Environment.Production,
		merchantId: '7t82byzdjdbkwp8m',
		publicKey: '5hnt7srpm7x5d2qp',
		privateKey: '6f8520869e0dd6bf8eec2956752166d9'
	});
}
else if(stage==='development') {
	var gateway = braintree.connect({
		environment: braintree.Environment.Sandbox,
		merchantId: 'jbp33kzvs7tp3djq',
		publicKey: 'swm4xbv63c7rgt7v',
		privateKey: 'b7a045a67ae6fc5489c5cb1ac3f0797a'
	});
}



setInterval(function() {
	// var client = new pg.Client(conString);
	// client.connect(function(err) {
	// 	if(err) return client.end();
	// 	var conversations = 0;
	// 	var viewedConversations = 0;
	// 	var query = [
	// 		'select conversations.id from conversations, pick_up_success, posts',
	// 		'WHERE pick_up_success.post_id = conversations.post_id AND',
	// 		'pick_up_success.pick_up_success = false AND',
	// 		'pick_up_success.rejected = false AND pick_up_success.undibbed = false'
	// 	].join(' ');
	// 	client.query(query, function(err, result) {
	// 		if(err) return console.log('mail message error: ', err);
	// 		result.rows.forEach(function() {
	// 			query = [
	// 				'SELECT read FROM messages WHERE conversation_id = $1 AND emailed = false ORDER BY date_created DESC LIMIT(1)'
	// 			].join(' ');
	// 			var values = [i];
	//
	// 			client.query(query, values, function(err, result1) {
	// 				if(result1.rows[0]) {
	//
	// 					// query = [].join('');
	// 					// client.query(query, values, function(err, result2) {
	// 					//
	// 					// });
	// 				}
	// 			});
	// 		});
	// 	});
	// });
}, 1000 );


function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.send('unauthorized access');
}

function apiError(res, err) {
	console.log(err);
	res.send({
		err : {
			message : err,
			redirect : false
		}
	});
}

/* STUFF MANAGEMENT - START */
router.get('/stuff', function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT posts.id, posts.title, posts.description, posts.attended,',
			'posts.lat, posts.lng, categories.category, images.image_url',
			'FROM posts, images, categories WHERE images.post_id = posts.id AND',
			'categories.id = posts.category_id AND posts.dibbed = false AND images.main = true AND',
			// 'posts.archived = false AND ((posts.date_created > now()::date - 7 AND posts.attended = true) OR (posts.date_created > now()::date - 3 AND posts.attended = false))',
			'posts.archived = false AND ((posts.attended = true) OR (posts.date_created > now()::date - 3 AND posts.attended = false))',
		].join(' ');
		var values = [];
		if(req.session.passport && req.session.passport.user) {
			query += ' AND NOT posts.user_id = $1';
			values.push(req.session.passport.user.id);
		}
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			result.rows.forEach(function(e, i) {
				var randVal = 0.0002;
				result.rows[i].lat += ((Math.random() * randVal) - (randVal / 2));
				result.rows[i].lng += ((Math.random() * randVal) - (randVal / 2));
			});
			res.send({
				err: null,
				res: result.rows
			});
			client.end();
		});
	});
});

router.get('/stuff/id/:id', function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT posts.id, posts.title, posts.description, posts.attended,',
			'posts.lat, posts.lng, categories.category, images.image_url,',
			'posts.date_created',
			'FROM posts, images, categories',
			'WHERE images.post_id = posts.id AND posts.id = $1 AND',
			'categories.id = posts.category_id AND images.main = true'
		].join(' ');
		var values = [
			req.params.id
		];
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			res.send({
				err: null,
				res: result.rows[0]
			});
			client.end();
		});
	});
});

router.get('/stuff/my', isAuthenticated, function(req, res) {
	var query = [
		'SELECT posts.id, posts.title, posts.description, posts.archived,',
		'posts.expired, images.image_url, categories.category FROM posts,',
		'images, categories WHERE (posts.user_id = $1 OR posts.dibber_id = $1) AND',
		'posts.archived = false AND images.post_id = posts.id AND',
		'images.main = true AND categories.id = posts.category_id'
	].join(' ');
	var values = [
		req.session.passport.user.id
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result
		});
	});
});

router.get('/stuff/my/id/:id', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT posts.id, posts.dibbed, posts.dibber_id, posts.user_id, posts.title, posts.description, posts.attended,',
			'posts.lat, posts.lng, categories.category, images.image_url',
			'FROM posts, images, categories',
			'WHERE images.post_id = posts.id AND (posts.user_id = $1 OR posts.dibber_id = $1) AND',
			'posts.id = $2 AND categories.id = posts.category_id AND images.main = true'
		].join(' ');
		var values = [
			parseInt(req.session.passport.user.id),
			parseInt(req.params.id)
		];
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			console.log(result);
			result.rows[0].type = (parseInt(result.rows[0].dibber_id) === parseInt(req.session.passport.user.id))?'dibber':'lister';
			query = 'SELECT id FROM conversations WHERE post_id = $1 AND archived = false';
			values = [result.rows[0].id];
			client.query(query, values, function(err, result2) {
				if(!err && result2.rows.length) result.rows[0].conversation_id = result2.rows[0].id;
				res.send({
					err: null,
					res: result.rows[0]
				});
				client.end();
			});
		});
	});
});

router.get('/stuff/bounds/:north/:south/:west/:east', function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT * FROM posts WHERE lat <= $1 AND lat >= $2 AND lng >= $3 AND lng <= $4',
		].join('');
		var values = [
			req.params.north,
			req.params.south,
			req.params.west,
			req.params.east
		];
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			res.send({
				err:null,
				res:result.rows
			});
		});
	});
});

router.post('/stuff', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'INSERT INTO posts',
			'(user_id, title, description, lat, lng, attended, category_id)',
			'VALUES ($1, $2, $3, $4, $5, $6, $7)',
			'RETURNING id'
		].join(' ');
		var values = [
			req.session.passport.user.id,
			req.body.title,
			req.body.description,
			req.body.lat,
			req.body.lng,
			req.body.attended,
			req.body.category
		];
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			if(req.body.test) {
				var query = [
					'INSERT INTO images',
					'(post_id, image_url, main)',
					'VALUES ($1, $2, true)'
				].join(' ');
				var time = Date.now().toString();
				var buff = new Buffer(req.body.test.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
				fs.writeFile(__dirname + '/../../../uploads/original/'+time+'.png', buff, function(err) {
					// imagemin([__dirname+'/../../../uploads/original/'+time+'.png'], __dirname+'/../../../uploads/build/', {use: [imageminPngquant({speed:10,quality:60})]}).then(function(err, err2) {
					// console.log(err, err2);
					fs.readFile(__dirname + '/../../../uploads/original/'+time+'.png', function(err, data) {
						// var buf = new Buffer(req.body.test.replace(/^data:image\/\w+;base64,/, ""),'base64');
						var key = 'posts/' + time;
						s3.upload({
							Bucket: 'stuffmapper-v2',
							Key: key,
							Body: data,
							ContentEncoding: 'base64',
							ContentType:'image/png',
							ACL: 'public-read'
						}, function(err, data) {
							if (err) {
								client.end();
								res.send('Error uploading data: ', err);
								return console.log('Error uploading data: ', err);
							}
							console.log('Successfully uploaded data to myBucket/myKey');
							var values = [
								result.rows[0].id,
								'/'+key
							];
							client.query(query, values, function(err, result) {
								if(err) {
									apiError(res, err);
									return client.end();
								}
								res.send({
									err : null,
									res : {
										success: true
									}
								});
								client.end();
							});
						});
					});
					// });
				});
			}
			else {
				res.send({
					err : null,
					res : {
						success: true
					}
				});
				client.end();
			}
		});
	});
});

router.post('/stuff/:id', isAuthenticated, function(req, res) {
	console.log(req.body);
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'UPDATE posts SET title = $2, description = $3, lat = $4, lng = $5,',
			'category_id = $6 WHERE id = $7 AND user_id = $1',
			'RETURNING id'
		].join(' ');
		var values = [
			req.session.passport.user.id,
			req.body.title,
			req.body.description,
			req.body.lat,
			req.body.lng,
			req.body.category,
			req.params.id
		];
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			if(req.body.test) {
				client.query('UPDATE images SET main = false WHERE post_id = $1', [req.params.id], function(err) {
					if(err) {
						apiError(res, err);
						return client.end();
					}
					var query = [
						'INSERT INTO images',
						'(post_id, image_url, main)',
						'VALUES ($1, $2, true)'
					].join(' ');
					var time = Date.now().toString();
					var buff = new Buffer(req.body.test.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
					fs.writeFile(__dirname + '/../../../uploads/original/'+time+'.png', buff, function(err) {
						console.log(err);
						// imagemin([__dirname+'/../../../uploads/original/'+time+'.png'], __dirname+'/../../../uploads/build/', {use: [imageminPngquant({speed:10,quality:60})]}).then(function(err, err2) {
						// console.log(err, err2);
						fs.readFile(__dirname + '/../../../uploads/original/'+time+'.png', function(err, data) {
							console.log(err);
							// var buf = new Buffer(req.body.test.replace(/^data:image\/\w+;base64,/, ""),'base64');
							var key = 'posts/' + time;
							s3.upload({
								Bucket: 'stuffmapper-v2',
								Key: key,
								Body: data,
								ContentEncoding: 'base64',
								ContentType:'image/png',
								ACL: 'public-read'
							}, function(err, data) {
								if (err) {
									client.end();
									res.send('Error uploading data: ', err);
									return console.log('Error uploading data: ', err);
								}
								console.log('Successfully uploaded data to myBucket/myKey');
								var values = [
									result.rows[0].id,
									'/'+key
								];
								client.query(query, values, function(err, result) {
									if(err) {
										apiError(res, err);
										return client.end();
									}
									res.send({
										err : null,
										res : {
											success: true
										}
									});
									client.end();
								});
							});
						});
					});
				});
			}
			else {
				res.send({
					err : null,
					res : {
						success: true
					}
				});
				client.end();
			}
		});
	});
});

router.delete('/stuff/id/:id', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'UPDATE posts SET archived = true',
			'WHERE dibbed = false AND id = $2 AND user_id = $1',
			'RETURNING *'
		].join(' ');
		var values = [
			req.session.passport.user.id,
			req.params.id
		];
		client.query(query, values, function(err, result1) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var query = [
				'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
				'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3',
				'RETURNING *'
			].join(' ');
			var values = [
				result1.rows[0].id,
				result1.rows[0].user_id,
				req.session.passport.user.id
			];
			client.query(query, values, function(err, result2) {
				if(err) {
					apiError(res, err);
					return client.end();
				}
				var query = [
					'UPDATE conversations SET archived = true, date_edited = current_timestamp',
					'WHERE dibber_id = $2 AND lister_id = $3 AND post_id = $1',
					'RETURNING *'
				].join(' ');
				var values = [
					req.params.id,
					result1.rows[0].user_id,
					req.session.passport.user.id
				];
				client.query(query, values, function(err, result3) {
					if(err) {
						apiError(res, err);
						return client.end();
					}
					res.send({
						err: null,
						res: {
							'res1': result1.rows,
							'res2': result2.rows,
							'res3': result3.rows
						}
					});
					return client.end();
				});
			});
		});
	});
});

/* STUFF MANAGEMENT -  END  */

/* CATEGORIES - START */

router.get('/categories', function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = 'SELECT * FROM categories';
		client.query(query, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			res.send({
				err: null,
				res: result.rows
			});
			return client.end();
		});
	});
});

router.get('/category/name/:name', function(req, res) {

});

router.get('/category/id/:id', function(req, res) {

});

router.post('/category', isAuthenticated, function(req, res) {

});

/* CATEGORIES -  END  */

/* BASIC USER MANAGEMENT - START */

router.get('/views', function() {
	var sess = req.session;
	sess.views = sess.views?sess.views+1:1;
	res.send({
		err : null,
		res : {
			views : views
		}
	});
});

/* BASIC USER MANAGEMENT -  END  */

/* USER ACCOUNT MANAGEMENT - START */

router.post('/account/status', function(req, res) {
	queryServer(res, 'SELECT pick_up_success FROM pick_up_success WHERE pick_up_success = true', [], function(result) {
		//		console.log(req.session);
		if(req.session.passport && req.session.passport.user) {
			console.log('logged in');
			res.send({
				err: null,
				res: {
					user: req.session.passport.user,
					lt: (27 + parseInt(result.rows.length))
				}
			});
		}
		else {
			console.log('not logged in');
			res.send({
				err: null,
				res : {
					user: false,
					lt: (27 + parseInt(result.rows.length))
				}
			});
		}
	});
});

router.post('/account/register', function(req, res) {
	var client = new pg.Client(conString);
	var b = req.body;
	client.connect(function(){
		var query = [
			'SELECT id FROM users WHERE email = $1'
		].join(' ');
		var values = [
			b.email
		];
		client.query(query, values, function(err, result1) {
			if(!result1.rows[0]) {
				gateway.clientToken.generate({}, function (err, response) {
					bcrypt.hash(b.password, saltRounds, function(err, hashedPassword) {
						var adjectives = ['friendly','amicable','emotional','strategic','informational','formative','formal','sweet','spicy','sour','bitter','determined','committed','wide','narrow','deep','profound','amusing','sunny','cloudy','windy','breezy','organic','incomparable','healthy','understanding','reasonable','rational','lazy','energetic','exceptional','sleepy','relaxing','delicious','fragrant','fun','marvelous','enchanted','magical','hot','cold','rough','smooth','wet','dry','super','polite','cheerful','exuberant','spectacular','intelligent','witty','soaked','beautiful','handsome','oldschool','metallic','enlightened','lucky','historic','grand','polished','speedy','realistic','inspirational','dusty','happy','fuzzy','crunchy'];
						var nouns = ['toaster','couch','sofa','chair','shirt','microwave','fridge','iron','pants','jacket','skis','snowboard','spoon','plate','bowl','television','monitor','wood','bricks','silverware','desk','bicycle','book','broom','mop','dustpan','painting','videogame','fan','baseball','basketball','soccerball','football','tile','pillow','blanket','towel','belt','shoes','socks','hat','rug','doormat','tires','metal','rocks','oven','washer','dryer','sunglasses','textbooks','fishbowl'];
						var number = Math.floor(Math.random() * 9999) + 1;
						function capitalizeFirstLetter(string) {
							return string.charAt(0).toUpperCase() + string.slice(1);
						}
						var uname = capitalizeFirstLetter(adjectives[Math.floor(Math.random() * adjectives.length)]) + capitalizeFirstLetter(nouns[Math.floor(Math.random() * nouns.length)]) + number;
						var query = [
							'INSERT INTO users ',
							'(fname, lname, uname, email, password, phone_number, braintree_token)',
							'VALUES ($1, $2, $3, $4, $5, $6, $7)',
							'RETURNING *'
						].join(' ');
						var values = [
							b.fname,
							b.lname,
							uname,
							b.email,
							hashedPassword,
							b.phone_number,
							response.clientToken
						];
						client.query(query, values, function(err, result) {
							client.end();
							res.send({
								err : null,
								res : {
									redirect: true,
									user: result.rows[0]
								}
							});
							var emailTo = {};
							emailTo[uname] = b.email;
							sendTemplate(
								'email-verification',
								'Stuffmapper needs your confirmation!',
								emailTo,
								{
									'FIRSTNAME' : uname,
									'CONFIRMEMAIL' : 'https://'+config.subdomain+'.stuffmapper.com/stuff/get?email_verification_token=' + result.rows[0].verify_email_token,
									'ITEMIMAGE' : 'https://www.stuffmapper.com/img/give-pic-empty-01.png'
								}
							);
						});
					});
				});
			} else {
				client.end();
				return res.send({
					err: 'Hey! It looks like you already signed up with this email address. Need to <a href="/api/v1/accout/resetpassword">reset your password</a>?'
				});
			}
		});
	});
});

router.post('/account/verify', function(req,res) {
	console.log(req.body.emailVerificationToken);
	if(req.body.emailVerificationToken === 'testtoken') {
		res.send({
			res:'test@stuffmapper.com',
			err:null
		});
	}
	else if(req.body.emailVerificationToken) {
		var query = [
			'UPDATE users SET verify_email_token = null, verified_email = true',
			'WHERE verify_email_token = $1',
			'RETURNING email'
		].join(' ');
		var values = [
			req.body.emailVerificationToken,
		];
		queryServer(res, query, values, function(result) {
			if(result.rows.length >= 1) res.send({err:null,res:result.rows[0].email});
			else res.send({err:'invalid token',res:null});
		});
	}
});
router.post('/account/password/token', function(req,res) {
	if(req.body.email) {
		var query = [
			'UPDATE users SET password_reset_token = md5(random()::text) WHERE email = $1 RETURNING password_reset_token, uname, email'
		].join(' ');
		var values = [
			req.body.email
		];
		queryServer(res, query, values, function(result) {
			var row = result.rows[0];
			var to = {};
			to[row.uname] = row.email;
			sendTemplate(
				'password-reset',
				'Reset your Stuffmapper password',
				to,
				{
					'FIRSTNAME' : row.uname,
					'CHANGEPASSWORD' : 'https://'+config.subdomain+'.stuffmapper.com/stuff/get?password_reset_token='+row.password_reset_token
				}
			);
			if(result.rows.length >= 1) res.send({err:null});
			else res.send({err:'error'});
		});
	}
});
router.post('/account/password/verify', function(req,res) {
	if(req.body.passwordResetToken) {
		var query = [
			'SELECT email FROM users WHERE password_reset_token = $1'
		].join(' ');
		var values = [
			req.body.passwordResetToken
		];
		queryServer(res, query, values, function(result) {
			if(result.rows.length >= 1) res.send({err:null,res:{email:result.rows[0].email}});
			else res.send({err:'error'});
		});
	}
});

router.post('/account/password/reset', function(req,res) {
	if(req.body.passwordResetToken && req.body.password) {
		var query = [
			'UPDATE users SET password = $1, password_reset_token = null',
			'WHERE password_reset_token = $2 RETURNING *'
		].join(' ');
		bcrypt.hash(req.body.password, saltRounds, function(err, hashedPassword) {
			var values = [
				hashedPassword,
				req.body.passwordResetToken
			];
			queryServer(res, query, values, function(result) {
				if(result.rows.length >= 1) res.send({err:null});
				else res.send({err:'error'});
			});
		});
	}
});

router.post('/account/confirmation', function(req, res) {
	if(req.body.email_token) {
		var query = [
			'UPDATE users SET verified_email = true, verify_email_token = null',
			'WHERE verified_email = false AND verify_email_token = $1',
			'RETURNING email'
		].join(' ');
		var values = [
			req.body.email_token
		];
		queryServer(res, query, values, function(result) {
			if(result.rows.length >= 1) res.send({res:result.rows[0].email});
			else res.send({err:'There was an issue confirming your email address.  Please contact us at <a href="mailto:hello@stuffmapper.com">hello@stuffmapper.com</a> if this issue persists.'});
		});
	}
});

router.post('/account/login', function(req, res, next) {
	var passport = req._passport.instance;
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return res.send({
				err: err,
				res: {
					isValid: false
				}
			});
		}
		if (!user) {
			return res.send({
				err: err || info.message,
				res: {
					isValid: false
				}
			});
		}
		req.logIn(user, function(err) {
			if (err) {
				return res.send({
					err:err,
					res:{
						isValid:false
					}
				});
			}
			return res.send({
				err:err,
				res:{
					user:user,
					isValid:true
				}
			});
		});
	})(req, res, next);
});

router.post('/account/logout', isAuthenticated, function(req, res) {
	req.logout();
	res.send({
		err : null,
		res : true
	});
});

/* OAUTH2.0 - START */
/* GOOGLE OAUTH - START */

router.get('/account/login/google', passport.authenticate('google', {
	scope: [
		'https://www.googleapis.com/auth/plus.login',
		'https://www.googleapis.com/auth/plus.profile.emails.read'
	]
}));

router.get('/account/login/facebook', function(req, res, next) {next();}, passport.authenticate('facebook', {
	//session: false,
	scope: 'email'
}));

router.get('/account/info', isAuthenticated, function(req, res) {
	var query = [
		'SELECT * FROM users WHERE id = $1'
	].join('');
	var values = [
		req.session.passport.user.id
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result.rows[0]
		});
	});
});

router.put('/account/info', isAuthenticated, function(req, res) {
	var query = [
		'UPDATE users SET uname = $2, fname = $3, lname = $4, ',
		'phone_number = $5, email = $6, address = $7, city = $8, ',
		'state = $9, zip_code = $10, country = $11 ',
		'WHERE id = $1'
	].join('');
	var values = [
		req.session.passport.user.id,
		req.body.uname,
		req.body.fname,
		req.body.lname,
		req.body.phone_number,
		req.body.email,
		req.body.address,
		req.body.city,
		req.body.state,
		req.body.zip_code,
		req.body.country
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result
		});
	});
});

router.delete('/account/info', isAuthenticated, function(req, res) {
	// auto sign out when complete
	var id = req.session.passport.user.id;

});



/* GOOGLE OAUTH -  END  */

/* OAUTH2.0 -  END  */


/* USER ACCOUNT MANAGEMENT -  END  */







/* DIBS MANAGEMENT - START */
// router.post('/checkout/paiddibs', function(req, res) {
// 	var nonceFromTheClient = req.body.payment_method_nonce;
// 	if(!nonceFromTheClient) return res.send('failure');
// 	gateway.transaction.sale({
// 		amount: '1.00',
// 		paymentMethodNonce: nonceFromTheClient,
// 		options: {
// 			submitForSettlement: true
// 		}
// 	}, function (err, result) {
// 		if(err) return res.send('failure');
// 		res.send('success');
// 	});
// });


router.post('/dibs/:id', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'UPDATE posts SET dibber_id = $1, dibbed = true',
			'WHERE dibbed = false AND id = $2',
			'RETURNING *'
		].join(' ');
		var values = [
			req.session.passport.user.id,
			req.params.id
		];
		client.query(query, values, function(err, result1) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var nonceFromTheClient = req.body.payment_method_nonce;
			if(!nonceFromTheClient) return res.send('failure');
			gateway.transaction.sale({
				amount: '1.00',
				paymentMethodNonce: nonceFromTheClient,
				options: {
					submitForSettlement: true
				}
			}, function (err, result) {
				if(err) return res.send('failure');
				var query = [
					'INSERT INTO pick_up_success',
					'(post_id, dibber_id, lister_id)',
					'VALUES ($1, $2, $3) RETURNING *'
				].join(' ');
				var values = [
					req.params.id,
					req.session.passport.user.id,
					result1.rows[0].user_id
				];
				client.query(query, values, function(err, result2) {
					if(err) {
						apiError(res, err);
						return client.end();
					}
					query = [
						'INSERT INTO conversations',
						'(post_id, dibber_id, lister_id)',
						'VALUES ($1, $2, $3) RETURNING *'
					].join(' ');
					values = [
						req.params.id,
						req.session.passport.user.id,
						result1.rows[0].user_id
					];
					client.query(query, values, function(err, result3) {
						if(err) {
							apiError(res, err);
							return client.end();
						}
						res.send({
							err: null,
							res: {
								'res1': result1.rows,
								'res2': result2.rows,
								'res3': result3.rows
							}
						});
						if(result1.rows[0].unattended) return client.end();
						query = [
							'SELECT image_url FROM images WHERE post_id = $1'
						].join(' ');
						values = [
							req.params.id,
						];
						client.query(query, values, function(err, result4) {
							var emailTo = {};
							emailTo[(req.session.passport.user.uname)] = req.session.passport.user.email;
							sendTemplate(
								'dibber-notification-1',
								'You Dibs\'d an item!',
								emailTo,
								{
									'FIRSTNAME' : req.session.passport.user.uname,
									'CHATLINK' : 'https://'+config.subdomain+'.stuffmapper.com/stuff/my/messages/'+result3.rows[0].id,
									'MYSTUFFLINK' : 'https://'+config.subdomain+'.stuffmapper.com/stuff/my/items/'+req.params.id,
									'ITEMTITLE':result1.rows[0].title,
									'ITEMIMAGE':'https://cdn.stuffmapper.com'+result4.rows[0].image_url
								}
							);
							return client.end();
						});
					});
				});
			});
		});
	});
});



router.post('/undib/:id', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'UPDATE posts SET dibber_id = NULL, dibbed = false',
			'WHERE dibbed = true AND id = $2 AND dibber_id = $1',
			'RETURNING *'
		].join(' ');
		var values = [
			req.session.passport.user.id,
			req.params.id
		];
		client.query(query, values, function(err, result1) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var query = [
				'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
				'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3',
				'RETURNING *'
			].join(' ');
			console.log(result1.rows[0]);
			var values = [
				result1.rows[0].id,
				req.session.passport.user.id,
				result1.rows[0].user_id
			];
			client.query(query, values, function(err, result2) {
				if(err) {
					apiError(res, err);
					return client.end();
				}
				var query = [
					'UPDATE conversations SET archived = true, date_edited = current_timestamp',
					'WHERE dibber_id = $2 AND lister_id = $3 AND post_id = $1',
					'RETURNING *'
				].join(' ');
				var values = [
					req.params.id,
					req.session.passport.user.id,
					result1.rows[0].user_id
				];
				client.query(query, values, function(err, result3) {
					if(err) {
						apiError(res, err);
						return client.end();
					}
					res.send({
						err: null,
						res: {
							'res1': result1.rows,
							'res2': result2.rows,
							'res3': result3.rows
						}
					});
					// var emailTo = {};
					// emailTo[(req.session.passport.user.uname)] = req.session.passport.user.email;
					// sendTemplate(
					// 	'dibber-notification-1',
					// 	'You unDibbed an item!',
					// 	emailTo,
					// 	{
					// 		'FIRSTNAME' : req.session.passport.user.uname,
					// 		'CHATLINK' : 'http://'+config.subdomain+'.stuffmapper.com/stuff/get',
					// 		'MYSTUFFLINK' : 'http://'+config.subdomain+'.stuffmapper.com/stuff/my/items',
					// 		'ITEMTITLE':'NAH MANG THIS IS AN UNDIB'
					// 	}
					// );
					return client.end();
				});
			});
		});
	});
});

router.delete('/dibs/reject/:id', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'UPDATE posts SET dibbed = false',
			'WHERE dibbed = true AND id = $2 AND user_id = $1',
			'RETURNING *'
		].join(' ');
		var values = [
			req.session.passport.user.id,
			req.params.id
		];
		client.query(query, values, function(err, result1) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var query = [
				'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
				'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3',
				'RETURNING *'
			].join(' ');
			console.log(result1.rows[0]);
			var values = [
				result1.rows[0].id,
				result1.rows[0].dibber_id,
				req.session.passport.user.id
			];
			client.query(query, values, function(err, result2) {
				if(err) {
					apiError(res, err);
					return client.end();
				}
				var query = [
					'UPDATE conversations SET archived = true, date_edited = current_timestamp',
					'WHERE dibber_id = $2 AND lister_id = $3 AND post_id = $1',
					'RETURNING *'
				].join(' ');
				var values = [
					req.params.id,
					result1.rows[0].user_id,
					req.session.passport.user.id
				];
				client.query(query, values, function(err, result3) {
					if(err) {
						apiError(res, err);
						return client.end();
					}
					res.send({
						err: null,
						res: {
							'res1': result1.rows,
							'res2': result2.rows,
							'res3': result3.rows
						}
					});
					// var emailTo = {};
					// emailTo[(req.session.passport.user.uname)] = req.session.passport.user.email;
					// sendTemplate(
					// 	'dibber-notification-1',
					// 	'You unDibbed an item!',
					// 	emailTo,
					// 	{
					// 		'FIRSTNAME' : req.session.passport.user.uname,
					// 		'CHATLINK' : 'http://'+config.subdomain+'.stuffmapper.com/stuff/get',
					// 		'MYSTUFFLINK' : 'http://'+config.subdomain+'.stuffmapper.com/stuff/my/items',
					// 		'ITEMTITLE':''
					// 	}
					// );
					return client.end();
				});
			});
		});
	});
});

/* DIBS MANAGEMENT -  END  */

/* MESSAGING MANAGEMENT - START */

router.get('/messages', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT conversations.id, posts.user_id, images.image_url, posts.title FROM conversations, posts, images',
			'WHERE (conversations.lister_id = $1 OR',
			'conversations.dibber_id = $1) AND',
			'posts.id = conversations.post_id AND',
			'images.post_id = conversations.post_id',
			'ORDER BY conversations.date_created DESC'
		].join(' ');
		var values = [
			req.session.passport.user.id
		];
		client.query(query, values, function(err, result1) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var catcher = 0;
			var messagesRows = {};
			var cb = function(err, result2) {
				if(err) {
					apiError(res, err);
					return client.end();
				}
				if(result2.rows[0]) messagesRows[result2.rows[0].conversation_id] = result2.rows[0].message;
				if(++catcher === result1.rows.length) {
					res.send({
						err: null,
						res: result1.rows,
						messages : messagesRows
					});
					return client.end();
				}
			};
			for(var i = 0; i < result1.rows.length; ++i) {
				var query = [
					'SELECT messages.message, messages.conversation_id, posts.title FROM messages, posts',
					'WHERE messages.conversation_id = $1 AND posts.id = $2',
					'ORDER BY messages.date_created DESC LIMIT(1)'
				].join(' ');
				var values = [
					result1.rows[i].id,
					result1.rows[i].post_id
				];
				client.query(query, values, cb);
			}
		});
	});
});

router.post('/messages', isAuthenticated, function(req, res) {
	var query = [
		'INSERT INTO messages(conversation_id, user_id, message)',
		'values($1, $2, $3) RETURNING *'
	].join(' ');
	var values = [
		parseInt(req.body.conversation_id),
		req.session.passport.user.id,
		req.body.message
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result.rows
		});
	});
});

router.put('/messages/:id', isAuthenticated, function(req, res) {

});

router.delete('/messages/:id', isAuthenticated, function(req, res) {

});

router.get('/conversation/:post_id', isAuthenticated, function(req, res) {
	var query = [
		'SELECT conversations.post_id, conversations.lister_id,',
		'messages.user_id, messages.message, messages.date_created, messages.read FROM conversations,',
		'messages, posts WHERE messages.conversation_id = conversations.id',
		'AND conversations.archived = false AND conversations.post_id = $1 AND',
		'messages.archived = false AND posts.id = $1 ORDER BY messages.date_created DESC'
	].join(' ');
	var values = [
		req.params.post_id
	];
	queryServer(res, query, values, function(result) {
		console.log(result);
		var inboundMessenger = null;
		result.rows.forEach(function(e, i) {
			if(!inboundMessenger && result.rows[i].user_id !== parseInt(req.session.passport.user.id)) {
				inboundMessenger = parseInt(result.rows[i].user_id);
			}
			result.rows[i].type = ((parseInt(result.rows[i].user_id) === parseInt(req.session.passport.user.id))?'out':'in');
		});
		res.send({
			err: null,
			res: {
				conversation: result.rows,
				info: {
					inboundMessenger: inboundMessenger,
					outboundMessenger: parseInt(req.session.passport.user.id),
					id: req.params.id
				}
			}
		});
	});
});

/* MESSAGING MANAGEMENT -  END  */


/* WATCHLIST MANAGEMENT - START */

router.get('/watchlist', isAuthenticated, function(req, res) {
	//return all watchlist items
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT watchlist_keys.* FROM watchlist_items, watchlist_keys',
			'WHERE watchlist_items.user_id = $1 AND watchlist_keys.watchlist_item = watchlist_items.id'
		].join(' ');
		var values = [
			req.session.passport.user.id
		];
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var counter = 0;
			var keys = [];
			var lastWatchlistItem = null;
			var watchlistItemPos = 0;
			var watchlist = [];
			result.rows.forEach(function(e) {
				var query2 = [
					'SELECT * FROM ', e.category_id?'categories':'tag_names',
					' WHERE id = $1'
				].join('');
				var values2 = [
					e.category_id?e.category_id:e.tag_id
				];
				client.query(query2, values2, function(err, result2) {
					if(err) {
						apiError(res, err);
						return client.end();
					}
					if(lastWatchlistItem === null || lastWatchlistItem !== e.watchlist_item) {
						watchlist.push([]);
						watchlistItemPos = watchlist.length-1;
						lastWatchlistItem = e.watchlist_item;
					}
					watchlist[watchlistItemPos].push(result2.rows[0]);
					if(++counter === result.rows.length) {
						res.send({
							err: null,
							res: watchlist
						});
					}
				});
			});
		});
	});
});
router.get('/categoriesandtags', function(req, res) {
	console.log(req.query.q);
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'(SELECT category AS text, row_number() over() AS id FROM categories WHERE category SIMILAR TO \'%\' || $1 || \'%\') UNION ALL',
			'(SELECT tag_name AS text, row_number() over() AS id FROM tag_names WHERE tag_name SIMILAR TO \'%\' || $1 || \'%\') LIMIT 10'
		].join(' ');
		var values = [
			req.query.q
		];
		queryServer(res, query, values, function(result) {

			res.send({
				err: null,
				res: result.rows
			});
		});
	});
});
router.get('/watchlist/:id', isAuthenticated, function(req, res) {
	//return watchlist item
	var query = [
		'SELECT FROM watchlist_items WHERE id = $1, watchlist_id = $2'
	].join('');
	var values = [
		req.session.passport.user.id,
		req.params.watchlist_id
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result.rows[0]
		});
	});
});

router.post('/watchlist', function(req, res) {
	var category_tag_ids = [];
	var client = new pg.Client(conString);
	console.log(req.params);
	client.connect(function(err) {
		req.body.keys.forEach(function(e) {
			console.log(e);
			client.query('SELECT id FROM categories WHERE category = $1', [e], function(err, result1) {
				if(err) {
					apiError(res, err);
					return client.end();
				}

				if(result1.rows.length === 0) {
					client.query('INSERT INTO tag_names(tag_name) SELECT CAST($1 AS VARCHAR) WHERE NOT EXISTS (SELECT * FROM tag_names WHERE tag_name = $1) RETURNING id', [e], function(err, result2) {
						if(err) {
							apiError(res, err);
							return client.end();
						}
						if(!result2.rows.length) {
							client.query('SELECT id FROM tag_names WHERE tag_name = $1', [e], function(err, result3) {
								if(err) {
									apiError(res, err);
									return client.end();
								}
								console.log(err);
								console.log(result3);
								category_tag_ids.push({value:result3.rows[0].id,type:'tag'});
								if(category_tag_ids.length === req.body.keys.length) createWatchlist();
							});
						} else {
							console.log(result2.rows);
							console.log(!result2.rows);
							category_tag_ids.push({value:result2.rows[0].id,type:'tag'});

							if(category_tag_ids.length === req.body.keys.length) createWatchlist();
						}
					});
				}
				else {
					category_tag_ids.push({value:result1.rows[0].id,type:'category'});
					if(category_tag_ids.length === req.body.keys.length) createWatchlist();
				}
			});
		});
	});
	function createWatchlist() {
		var queries = 0;
		client.query('INSERT INTO watchlist_items (user_id) SELECT ($1) returning id', [req.session.passport.user.id], function(err, result1) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			category_tag_ids.forEach(function(e) {
				var values = [
					result1.rows[0].id,
					(e.type==='tag')?e.value:null,
					(e.type==='category')?e.value:null
				];
				client.query('INSERT INTO watchlist_keys (watchlist_item, tag_id, category_id) VALUES ($1, $2, $3)', values, function(err, result2) {
					if(++queries === req.body.keys.length){
						client.end();
						res.send({
							err:null,
							res:'success!'
						});
					}
				});
			});
		});
	}
});

router.put('/watchlist/:id', isAuthenticated, function(req, res) {
	//update watchlist item
});

router.delete('/watchlist/:id', isAuthenticated, function(req, res) {
	//archive watchlist item
	var query = [
		'DELETE FROM watchlist_items WHERE id = $1, watchlist_id = $2'
	].join('');
	var values = [
		req.session.passport.user.id,
		req.params.watchlist_id
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result.rows[0]
		});
	});
});

/* WATCHLIST MANAGEMENT -  END  */

/* SETTINGS - START */
router.get('/account/info', isAuthenticated, function(req, res) {
	var query = [
		'SELECT * FROM users WHERE id = $1'
	].join('');
	var values = [
		req.session.passport.user.id
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result.rows[0]
		});
	});
});

router.put('/account/info', isAuthenticated, function(req, res) {
	var query = [
		'UPDATE users SET uname = $2, fname = $3, lname = $4,',
		'phone_number = $5, email = $6, address = $7, city = $8,',
		'state = $9, zip_code = $10, country = $11',
		'WHERE id = $1 RETURNING *'
	].join(' ');
	var values = [
		req.session.passport.user.id,
		req.body.uname,
		req.body.fname,
		req.body.lname,
		req.body.phone_number,
		req.body.email,
		req.body.address,
		req.body.city,
		req.body.state,
		req.body.zip_code,
		req.body.country,
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err: null,
			res: result
		});
	});
});

router.delete('/account/info', isAuthenticated, function(req, res) {
	// ARCHIVE DO NOT DELETE
	var id = req.session.passport.user.id;

});

/* SETTINGS - END */




function queryServer(res, query, values, cb) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		client.query(query, values, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			client.end();
			cb(result);
		});
	});
}



// sendTemplate(
// 	'email-verification',
// 	'Stuffmapper needs your confirmation!',
// 	{
// 		'Ryan Farmer' : 'ryan.the.farmer@gmail.com'
// 	},
// 	{
// 		'FIRSTNAME' : 'Ryan',
// 		'CONFIRMEMAIL' : 'https://'+config.subdomain+'.stuffmapper.com/api/v1/account/confirmation/' + '93j923j0293j493209'
// 	}
// );

function sendTemplate(template, subject, to, args) {
	var mandrill = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
	var template_name = template;
	var template_content = [];
	Object.keys(args).forEach(function(e) {
		template_content.push({
			"name" : e,
			"content" : args[e]
		});
	});
	var emailTo = [];
	Object.keys(to).forEach(function(e) {
		emailTo.push({
			"email" : to[e],
			"name" : e,
			"type": "to"
		});
	});
	var message = {
		"subject": subject,
		"from_email": "support@stuffmapper.com",
		"from_name": "Stuffmapper Support",
		"to": emailTo,
		"headers": { "Reply-To": "no_reply@stuffmapper.com" },
		"merge": true,
		"merge_language": "mailchimp",
		"global_merge_vars": template_content
	};
	mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": false, "ip_pool": "Main Pool"}, function(result) {
		console.log(result);
	}, function(e) {
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}

module.exports = router;
