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
var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper1';
var braintree = require('braintree');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../config'))[stage];
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.accessKeyId = 'AKIAJQZ2JZJQHGJV7UBQ';
AWS.config.secretAccessKey = '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';
AWS.config.region = 'us-west-2';
var s3 = new AWS.S3({Bucket:'stuffmapper-v2',region:'us-west-2'});

if(stage==='production' || stage==='test') {
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
			else if(!result.rows.length) {
				return res.send({
					err: null,
					res: []
				});
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
		client.query(query, [req.params.id], function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			var randVal = 0.0002;
			result.rows[0].lat += ((Math.random() * randVal) - (randVal / 2));
			result.rows[0].lng += ((Math.random() * randVal) - (randVal / 2));
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
		'posts.expired, images.image_url, categories.category,',
		'posts.dibber_id, posts.date_edited, posts.attended FROM posts, images, categories WHERE',
		'(posts.user_id = $1 OR posts.dibber_id = $1) AND posts.archived = false AND',
		'images.post_id = posts.id AND images.main = true AND',
		'categories.id = posts.category_id'
	].join(' ');
	queryServer(res, query, [req.session.passport.user.id], function(result) {
		if(!result.rows.length) return res.send({err: null, res: [], test: [] });
		var rowsLen = result.rows.length;
		var rowCount = 0;
		var result1 = {rows:[]};
		var testresult = {rows:[]};
		result.rows.forEach(function(e, i) {
			var query = [
				'SELECT * FROM pick_up_success WHERE undibbed = false AND',
				'(dibber_id = $1 OR lister_id = $1) AND post_id = $2',
				'AND pick_up_success = true'
			].join(' ');
			queryServer(res, query, [req.session.passport.user.id, e.id], function(result2) {
				if(!result2.rows.length) result1.rows.push(e);
				else testresult.rows.push(e);
				// else if(parseInt(result2.rows[0].lister_id) === parseInt(req.session.passport.user.id)) testresult.rows.push(e);
				if(++rowCount === rowsLen) {
					rowsLen = result1.rows.length;
					rowCount = 0;
					result1.rows.forEach(function(e, i) {
						var query1 = [
							'SELECT count(messages) FROM messages, conversations WHERE',
							'conversations.post_id = $1 AND messages.conversation_id =',
							'conversations.id AND conversations.archived = false AND',
							'messages.archived = false AND messages.read = false AND',
							'NOT messages.user_id = $2'
						].join(' ');
						queryServer(res, query1, [parseInt(result1.rows[i].id),req.session.passport.user.id], function(result3) {
							queryServer(res, 'SELECT count(messages) FROM messages, conversations WHERE conversations.post_id = $1 AND messages.conversation_id = conversations.id AND conversations.archived = false AND messages.archived = false AND messages.user_id = $2', [parseInt(result1.rows[i].id),req.session.passport.user.id], function(result4) {
								queryServer(res, 'select posts.date_edited from posts where posts.id = $1 order by posts.date_edited desc limit 1', [parseInt(result1.rows[i].id)], function(result5) {
									queryServer(res, 'select messages.date_created from messages, conversations where conversations.post_id = $1 AND messages.conversation_id = conversations.id order by messages.date_created desc limit 1', [parseInt(result1.rows[i].id)], function(result6) {
										queryServer(res, 'select conversations.date_created from messages, conversations where conversations.post_id = $1 AND messages.conversation_id = conversations.id order by conversations.date_created desc limit 1', [parseInt(result1.rows[i].id)], function(result7) {
											var dates = {
												post_id: result5.rows[0].date_edited,
												message_id: (result6.rows[0] && result6.rows[0].date_created) || 0,
												conversation_id: (result7.rows[0] && result7.rows[0].date_created) || 0
											};
											var newDate = new Date(dates.post_date).getTime()>new Date(dates.message_date)?dates.post_date:dates.message_date;
											newDate = new Date(newDate).getTime()>new Date(dates.conversation_date)?newDate:dates.conversation_date;
											result1.rows[i].messages = {
												post_id: result1.rows[i].id,
												count: result3.rows[0].count,
												from_user: result4.rows[0].count
											};
											result1.rows[i].last_touch_date = new Date(newDate).getTime();
											if(++rowCount === rowsLen) {
												res.send({
													err: null,
													res: result1.rows,
													test: testresult.rows
												});
											}
										});
									});
								});
							});
						});
					});
				}
			});
		});
	});
});

router.get('/stuff/my/id/:id', isAuthenticated, function(req, res) {
	var query = [
		'SELECT posts.id, posts.dibbed, posts.user_id, posts.dibber_id, posts.user_id, posts.title, posts.description, posts.attended,',
		'posts.lat, posts.lng, categories.category, images.image_url',
		'FROM posts, images, categories',
		'WHERE images.post_id = posts.id AND (posts.user_id = $1 OR posts.dibber_id = $1) AND',
		'posts.id = $2 AND categories.id = posts.category_id AND images.main = true'
	].join(' ');
	var values = [
		parseInt(req.session.passport.user.id),
		parseInt(req.params.id)
	];
	queryServer(res, query, values, function(result) {
		result.rows[0].type = (parseInt(result.rows[0].dibber_id) === parseInt(req.session.passport.user.id))?'dibber':'lister';
		queryServer(res, 'SELECT id FROM conversations WHERE post_id = $1 AND archived = false', [result.rows[0].id], function(result2) {
			if(result2.rows.length) result.rows[0].conversation_id = result2.rows[0].id;
			queryServer(res, 'SELECT id, uname FROM users WHERE id = $1 OR id = $2', [result.rows[0].user_id, result.rows[0].dibber_id], function(result3) {
				if(result3.rows.length) {
					var tmp = {};
					result3.rows.forEach(function(e) {
						tmp[e.id] = e.uname;
					});
					result.rows[0].users = tmp;
				}
				res.send({
					err: null,
					res: result.rows[0]
				});
			});
		});
	});
});

router.get('/stuff/bounds/:north/:south/:west/:east', function(req, res) {
	var query = 'SELECT * FROM posts WHERE lat <= $1 AND lat >= $2 AND lng >= $3 AND lng <= $4';
	var values = [
		req.params.north,
		req.params.south,
		req.params.west,
		req.params.east
	];
	queryServer(res, query, values, function(result) {
		res.send({
			err:null,
			res:result.rows
		});
	});
});

router.post('/stuff', isAuthenticated, function(req, res) {
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
	queryServer(res, query, values, function(result) {
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
					console.log(err, data);
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
							res.send('Error uploading data: ', err);
							return console.log('Error uploading data: ', err);
						}
						var values = [
							result.rows[0].id,
							'/'+key
						];
						queryServer(res, query, values, function() {
							res.send({
								err : null,
								res : {
									id: result.rows[0].id
								}
							});
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
		}
	});
});

router.post('/stuff/:id', isAuthenticated, function(req, res) {
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
	queryServer(res, query, values, function(result) {
		if(req.body.test) {
			queryServer(res, 'UPDATE images SET main = false WHERE post_id = $1', [req.params.id], function() {
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
								res.send('Error uploading data: ', err);
								return console.log('Error uploading data: ', err);
							}
							var values = [
								result.rows[0].id,
								'/'+key
							];
							queryServer(res, query, values, function(result) {
								res.send({
									err : null,
									res : {
										success: true
									}
								});
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
		}
	});
});

router.delete('/stuff/id/:id', isAuthenticated, function(req, res) {
	var query = [
		'UPDATE posts SET archived = true',
		'WHERE dibbed = false AND id = $2 AND user_id = $1',
		'RETURNING *'
	].join(' ');
	var values = [
		req.session.passport.user.id,
		req.params.id
	];
	queryServer(res, query, values, function(result1) {
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
		queryServer(res, query, values, function(result2) {
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
			queryServer(res, query, values, function(result3) {
				res.send({
					err: null,
					res: {
						'res1': result1.rows,
						'res2': result2.rows,
						'res3': result3.rows
					}
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
	queryServer(res, 'SELECT pick_up_success FROM pick_up_success WHERE pick_up_success = true AND undibbed = false', [], function(result1) {
		console.log(req.session);
		if(req.session.passport && req.session.passport.user) {
			var query = [
				'SELECT count(messages.read) FROM conversations, messages WHERE',
				'(conversations.lister_id = $1 OR conversations.dibber_id = $1) AND',
				'conversations.archived = false AND messages.conversation_id =',
				'conversations.id AND NOT messages.user_id = $1 AND messages.read = false'
			].join(' ');
			queryServer(res, query, [req.session.passport.user.id], function(result2) {
				res.send({
					err: null,
					res: {
						user: req.session.passport.user,
						lt: (27 + parseInt(result1.rows.length)),
						messages: result2.rows?result2.rows[0].count:null
					}
				});
			});
		}
		else {
			res.send({
				err: null,
				res : {
					user: false,
					lt: (27 + parseInt(result1.rows.length))
				}
			});
		}
	});
});

router.post('/account/register', function(req, res) {
	var b = req.body;
	queryServer(res, 'SELECT id FROM users WHERE email = $1', [b.email], function(result1) {
		if(!result1.rows[0]) {
			gateway.clientToken.generate({}, function (err, response) {
				console.log(err, response);
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
					queryServer(res, query, values, function(result) {
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
								'ITEMIMAGE' : 'https://www.stuffmapper.com/img/give-pic-©-01.png'
							}
						);
					});
				});
			});
		} else {
			return res.send({
				err: 'Hey! It looks like you already signed up with this email address. Need to <a href="/api/v1/accout/resetpassword">reset your password</a>?'
			});
		}
	});
});

router.post('/account/verify', function(req,res) {
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
			if(!result.rows.length) return res.send({err: 'email doesn\'t exist'});
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
		queryServer(res, 'SELECT email FROM users WHERE password_reset_token = $1', [req.body.passwordResetToken], function(result) {
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
		queryServer(res, query, [req.body.email_token], function(result) {
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
	queryServer(res, 'SELECT * FROM users WHERE id = $1', [req.session.passport.user.id], function(result) {
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
	queryServer(res, 'UPDATE posts SET dibber_id = $1, dibbed = true WHERE dibbed = false AND id = $2 RETURNING *', [req.session.passport.user.id,req.params.id], function(result1) {
		queryServer(res, 'SELECT email FROM users WHERE id = $1', [req.session.passport.user.id], function(result0) {
			var nonceFromTheClient = req.body.payment_method_nonce;
			if(!nonceFromTheClient) return res.send('failure');
			gateway.transaction.sale({
				amount: '1.00',
				paymentMethodNonce: nonceFromTheClient,
				options: {
					submitForSettlement: true
				},
				customer :{
					email: result0.rows[0].email
				}
			}, function (err, result) {
				console.log(err, result);
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
				queryServer(res, query, values, function(result2) {
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
					queryServer(res, query, values, function(result3) {
						res.send({
							err: null,
							res: {
								'res1': result1.rows,
								'res2': result2.rows,
								'res3': result3.rows
							}
						});
						if(result1.rows[0].unattended) return;
						queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function(result4) {
							var emailTo = {};
							emailTo[(req.session.passport.user.uname)] = req.session.passport.user.email;
							var slug = 'dibber-notification-1';
							if(result1.rows[0].unattended) slug = 'dibber-notification-unattended';
							sendTemplate(
								slug,
								'You Dibs\'d an item!',
								emailTo,
								{
									'FIRSTNAME' : req.session.passport.user.uname,
									'CHATLINK' : 'https://'+config.subdomain+'.stuffmapper.com/stuff/my/items/'+req.params.id+'/messages',
									'MYSTUFFLINK' : 'https://'+config.subdomain+'.stuffmapper.com/stuff/my/items/'+req.params.id,
									'ITEMTITLE':result1.rows[0].title,
									'ITEMIMAGE':'https://cdn.stuffmapper.com'+result4.rows[0].image_url
								}
							);
						});
					});
				});
			});
		});
	});
});

router.post('/dibs/complete/:id', isAuthenticated, function(req, res) {
	var query = [
		'UPDATE pick_up_success SET pick_up_success = true',
		'FROM posts p2 WHERE p2.dibbed = true AND',
		'pick_up_success.pick_up_success = false AND',
		'pick_up_success.post_id = p2.id AND p2.id = $2 AND',
		'(p2.user_id = $1 OR p2.dibber_id = $1)',
		'RETURNING *'
	].join(' ');
	queryServer(res, query, [req.session.passport.user.id,req.params.id], function(result1) {
		res.send({
			err: null,
			res: {success: (result1.rows.length === 1)}
		});
		queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function(result2) {
			[result1.rows[0].dibber_id, result1.rows[0].user_id].forEach(function(e){
				queryServer(res, 'SELECT email FROM users WHERE id = $1', [e], function(result3) {
					sendTemplate(
						'dibs-complete',
						'Dibs for '+result1.rows[0].title+' is complete!',
						result3.rows[0].email,
						{
							'ITEMTITLE':result1.rows[0].title,
							'ITEMIMAGE':'https://cdn.stuffmapper.com'+result2.rows[0].image_url
						}
					);
				});
			});
		});
	});
});

router.post('/undib/:id', isAuthenticated, function(req, res) {
	var query = [
		'UPDATE posts SET dibber_id = NULL, dibbed = false',
		'WHERE dibbed = true AND id = $2 AND dibber_id = $1',
		'RETURNING *'
	].join(' ');
	var values = [
		req.session.passport.user.id,
		req.params.id
	];
	queryServer(res, query, values, function(result1) {
		var query = [
			'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
			'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3',
			'RETURNING *'
		].join(' ');
		var values = [
			req.params.id,
			req.session.passport.user.id,
			result1.rows[0].user_id
		];
		queryServer(res, query, values, function(result2) {
			var query = [
				'UPDATE conversations SET archived = true, date_edited = current_timestamp',
				'WHERE post_id = $1',
				'RETURNING *'
			].join(' ');
			var values = [
				req.params.id
			];
			queryServer(res, query, values, function(result3) {
				res.send({
					err: null,
					res: {
						'res1': result1.rows,
						'res2': result2.rows,
						'res3': result3.rows
					}
				});
				var query = 'SELECT uname, email FROM users WHERE id = $1';
				var values = [result1.rows[0].user_id];
				queryServer(res, query, values, function(result4){
					query = [
						'SELECT image_url FROM images WHERE post_id = $1 AND main = true'
					].join(' ');
					values = [
						req.params.id,
					];
					queryServer(res, query, values, function(result5) {
						var emailTo = {[result4.rows[0].uname]:result4.rows[0].email};
						sendTemplate(
							'notify-undib',
							'Your item has been unDibs\'d',
							emailTo,
							{
								'FIRSTNAME' : result4.rows[0].uname,
								'USERNAME' : req.session.passport.user.uname,
								'MYSTUFFLINK' : 'http://'+config.subdomain+'.stuffmapper.com/stuff/my/items/'+result1.rows[0].id,
								'ITEMTITLE':result1.rows[0].title,
								'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url
							}
						);
					});
				});
			});
		});
	});
});

router.delete('/dibs/reject/:id', isAuthenticated, function(req, res) {
	queryServer(res, 'SELECT * FROM posts WHERE id = $1', [req.params.id], function(result0) {
		query = [
			'UPDATE posts SET dibbed = false, dibber_id = null',
			'WHERE dibbed = true AND id = $2 AND user_id = $1',
			'RETURNING *'
		].join(' ');
		values = [
			req.session.passport.user.id,
			req.params.id
		];
		queryServer(res, query, values, function(result1) {
			query = [
				'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
				'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3',
				'RETURNING *'
			].join(' ');
			values = [
				req.params.id,
				result0.rows[0].dibber_id,
				req.session.passport.user.id
			];
			queryServer(res, query, values, function(result2) {
				var query = [
					'UPDATE conversations SET archived = true, date_edited = current_timestamp',
					'WHERE post_id = $1',
					'RETURNING *'
				].join(' ');
				var values = [
					req.params.id
				];
				queryServer(res, query, values, function(result3) {
					res.send({
						err: null,
						res: {
							'res1': result1.rows,
							'res2': result2.rows,
							'res3': result3.rows
						}
					});
					queryServer(res, 'SELECT uname, email FROM users WHERE id = $1', [result0.rows[0].dibber_id], function(result4) {
						queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function(result5) {
							var emailTo = {[result4.rows[0].uname] : result4.rows[0].email};
							sendTemplate(
								'dibs-declined',
								'Your Dibs has been cancelled',
								emailTo,
								{
									'FIRSTNAME' : result4.rows[0].uname,
									'ITEMTITLE':result1.rows[0].title,
									'ITEMNAME':result1.rows[0].title,
									'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url,
									'GETSTUFFLINK':'https://www.stuffmapper.com'
								}
							);
						});
					});
				});
			});
		});
	});
});

/* DIBS MANAGEMENT -  END  */

/* MESSAGING MANAGEMENT - START */
// order by things
router.get('/messages', isAuthenticated, function(req, res) {
	var query = [
		'SELECT conversations.id, posts.user_id, images.image_url, posts.title FROM conversations, posts, images',
		'WHERE (conversations.lister_id = $1 OR',
		'conversations.dibber_id = $1) AND',
		'conversations.archived = false AND',
		'posts.id = conversations.post_id AND',
		'images.post_id = conversations.post_id',
		'ORDER BY conversations.date_created DESC'
	].join(' ');
	var values = [
		req.session.passport.user.id
	];
	queryServer(res, query, values, function(result1) {
		var catcher = 0;
		var messagesRows = {};
		var cb = function(result2) {
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
			queryServer(res, query, values, cb);
		}
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

router.post('/conversation/read/:post_id', isAuthenticated, function(req, res) {
	queryServer(res, 'SELECT id FROM conversations WHERE post_id = $1 AND archived = false', [req.params.post_id], function(result) {
		queryServer(res, 'UPDATE messages SET read = true WHERE conversation_id = $1 AND archived = false', [result.rows[0].id], function() {
			queryServer(res, 'SELECT count(messages) FROM messages, conversations WHERE (conversations.lister_id = $1 OR conversations.dibber_id = $1) AND NOT messages.user_id = $1 AND messages.conversation_id = conversations.id AND conversations.archived = false AND messages.archived = false AND messages.read = false', [req.session.passport.user.id], function(result) {
				res.send({
					err: null,
					res: result.rows[0].count
				});
			});
		});
	});
});
router.get('/conversation/:post_id', isAuthenticated, function(req, res) {
	var query = [
		'SELECT conversations.id, conversations.post_id, conversations.lister_id,',
		'conversations.dibber_id, posts.title, posts.description,',
		'images.image_url FROM conversations, posts, images WHERE',
		'conversations.post_id = $1 AND conversations.archived = false AND',
		'posts.id = $1 AND images.post_id = $1 AND images.main = true'
	].join(' ');
	var values = [
		req.params.post_id
	];
	queryServer(res, query, values, function(result1) {
		var query = [
			'SELECT messages.user_id, messages.message, messages.date_created,',
			// 'SELECT messages.user_id, messages.message, TO_CHAR(messages.date_created, \'HH:MIam – DD Mon YYYY TZ\') as date_created,',
			'messages.read FROM messages WHERE messages.conversation_id = $1 AND',
			'messages.archived = false ORDER BY messages.date_created DESC'
		].join(' ');
		var values = [
			result1.rows[0].id
		];
		queryServer(res, query, values, function(result) {
			queryServer(res, 'SELECT id, uname FROM users WHERE id = $1 OR id = $2', [result1.rows[0].lister_id, result1.rows[0].dibber_id], function(result3) {
				if(result3.rows.length) {
					var tmp = {};
					result3.rows.forEach(function(e) {
						tmp[e.id] = e.uname;
					});
					var inboundMessenger = parseInt(result1.rows[0].lister_id);
					if(result1.rows[0].dibber_id !== parseInt(req.session.passport.user.id)) {
						inboundMessenger = parseInt(result1.rows[0].dibber_id);
					}
					result.rows.forEach(function(e, i) {
						result.rows[i].type = ((parseInt(result.rows[i].user_id) === parseInt(req.session.passport.user.id))?'out':'in');
					});
					res.send({
						err: null,
						res: {
							conversation: result.rows,
							info: {
								inboundMessenger: inboundMessenger,
								outboundMessenger: parseInt(req.session.passport.user.id),
								id: parseInt(result1.rows[0].id),
								title: result1.rows[0].title,
								image: result1.rows[0].image_url,
								description: result1.rows[0].description,
								type: ((result1.rows[0].dibber_id === parseInt(req.session.passport.user.id))?('dibber'):('lister')),
								users: tmp,
								dibber_id: result1.rows[0].dibber_id,
								lister_id: result1.rows[0].lister_id,
								post_id: req.params.post_id
							}
						}
					});
				}
			});
		});
	});
});

/* MESSAGING MANAGEMENT -  END  */


/* WATCHLIST MANAGEMENT - START */

router.get('/watchlist', isAuthenticated, function(req, res) {
	//return all watchlist items
	var query = [
		'SELECT watchlist_keys.* FROM watchlist_items, watchlist_keys',
		'WHERE watchlist_items.user_id = $1 AND watchlist_keys.watchlist_item = watchlist_items.id'
	].join(' ');
	var values = [
		req.session.passport.user.id
	];
	queryServer(res, query, values, function(result) {
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
			queryServer(res, query2, values2, function(result2) {
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
router.get('/categoriesandtags', function(req, res) {
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
	req.body.keys.forEach(function(e) {
		queryServer(res, 'SELECT id FROM categories WHERE category = $1', [e], function(result1) {
			if(result1.rows.length === 0) {
				queryServer(res, 'INSERT INTO tag_names(tag_name) SELECT CAST($1 AS VARCHAR) WHERE NOT EXISTS (SELECT * FROM tag_names WHERE tag_name = $1) RETURNING id', [e], function(result2) {
					if(!result2.rows.length) {
						queryServer(res, 'SELECT id FROM tag_names WHERE tag_name = $1', [e], function(result3) {
							category_tag_ids.push({value:result3.rows[0].id,type:'tag'});
							if(category_tag_ids.length === req.body.keys.length) createWatchlist();
						});
					} else {
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
	function createWatchlist() {
		var queries = 0;
		queryServer(res, 'INSERT INTO watchlist_items (user_id) SELECT ($1) returning id', [req.session.passport.user.id], function(result1) {
			category_tag_ids.forEach(function(e) {
				var values = [
					result1.rows[0].id,
					(e.type==='tag')?e.value:null,
					(e.type==='category')?e.value:null
				];
				queryServer('INSERT INTO watchlist_keys (watchlist_item, tag_id, category_id) VALUES ($1, $2, $3)', values, function(result2) {
					if(++queries === req.body.keys.length){
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



function sendTemplate(template, subject, to, args) {
	var mandrill = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
	var template_name = template;
	var template_content = [];
	Object.keys(args).forEach(function(e) {
		template_content.push({
			'name' : e,
			'content' : args[e]
		});
	});
	var emailTo = [];
	Object.keys(to).forEach(function(e) {
		emailTo.push({
			'email' : to[e],
			'name' : e,
			'type': 'to'
		});
	});
	var message = {
		'subject': subject,
		'from_email': 'support@stuffmapper.com',
		'from_name': 'Stuffmapper Support',
		'to': emailTo,
		'headers': { 'Reply-To': 'no_reply@stuffmapper.com' },
		'merge': true,
		'merge_language': 'mailchimp',
		'global_merge_vars': template_content
	};
	mandrill_client.messages.sendTemplate({'template_name': template_name, 'template_content': template_content, 'message': message, 'async': false, 'ip_pool': 'Main Pool'}, function(result) {
		console.log(result);
	}, function(e) {
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}

module.exports = router;
