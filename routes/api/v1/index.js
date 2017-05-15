var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var imagemin = require('imagemin');
var imageminPngquant = require('imagemin-pngquant');
var saltRounds = 10;
var passport = require('passport');
var path = require('path');
var request = require('request');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../config'))[stage];
var pgUser = config.db.user;
var pgDb = config.db.db;
var pgPass = config.db.pass;
var pgHost = config.db.host;
var pgPort = config.db.port;
var conString = 'postgres://'+pgUser+':'+pgPass+'@'+pgHost+':'+pgPort+'/'+pgDb;
var braintree = require('braintree');
var AWS = require('aws-sdk');
AWS.config.update( {
	accessKeyId     : config.aws.accessKeyId,
	secretAccessKey : config.aws.secretAccessKey,
	region          : config.aws.region
});
var s3 = new AWS.S3({Bucket: config.aws.bucket});

var util = require('./../../../util.js');
var db = new util.db();


if(stage==='production' || stage==='development') {
	var gateway = braintree.connect({
		environment: braintree.Environment.Production,
		merchantId: '7t82byzdjdbkwp8m',
		publicKey: '5hnt7srpm7x5d2qp',
		privateKey: '6f8520869e0dd6bf8eec2956752166d9'
	});
}
else if(stage==='test') {
	var gateway = braintree.connect({
		environment: braintree.Environment.Sandbox,
		merchantId: 'jbp33kzvs7tp3djq',
		publicKey: 'swm4xbv63c7rgt7v',
		privateKey: 'b7a045a67ae6fc5489c5cb1ac3f0797a'
	});
}



// setInterval(function() {
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
// }, 1000 );


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
router.get('/stuff/:lat/:lng', function(req, res, next) {
	if(req.params.lat === 'id') return next();
	else if(!req.params.lat && !req.params.lng) return next();
	var lng = req.params.lng;
	var lat = req.params.lat;
	// var r = 3959;
	var r = 6371000;
	var query = [
		'SELECT posts.id, posts.title, posts.description, posts.attended,',
		'posts.lat, posts.lng, categories.category,',
		'($1*acos(cos($2)*cos(posts.lat)+sin($2)*sin(posts.lat)*cos($3-posts.lng))) as distance,',
		'images.image_url FROM posts, images, categories WHERE',
		'images.post_id = posts.id AND categories.id = posts.category_id AND',
		'posts.dibbed = false AND images.main = true AND',
		// 'posts.archived = false AND ((posts.date_created > now()::date - 7 AND posts.attended = true) OR (posts.date_created > now()::date - 3 AND posts.attended = false))',
		'posts.archived = false AND',
		'($1*acos(cos($2)*cos(posts.lat)+sin($2)*sin(posts.lat)*cos($3-posts.lng))) < $4 AND ',
		'((posts.attended = true) OR',
		'(posts.date_created > now()::date - 3 AND posts.attended = false))'
	].join(' ');
	var values = [r, lat, lng, 15*1609.34*65];
	if(req.session.passport && req.session.passport.user) {
		query += ' AND NOT posts.user_id = $5 ';
		values.push(req.session.passport.user.id);
	}
	query += 'ORDER BY ($1*acos(cos($2)*cos(posts.lat)+sin($2)*sin(posts.lat)*cos($3-posts.lng))) ASC';
	queryServer(res, query, values, function(result) {
		if(!result.rows.length) {
			return res.send({
				err: null,
				res: []
			});
		}
		// console.log(result.rows);
		result.rows.forEach(function(e, i) {
			var randVal = 0.001;
			result.rows[i].lat += ((Math.random() * randVal) - (randVal / 2));
			result.rows[i].lng += ((Math.random() * randVal) - (randVal / 2));
		});
		res.send({
			err: null,
			res: result.rows
		});
	});
});





router.get('/stuff', function(req, res) {
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
	queryServer(res, query, values, function(result) {
		result.rows.forEach(function(e, i) {
			var randVal = 0.001;
			result.rows[i].lat += ((Math.random() * randVal) - (randVal / 2));
			result.rows[i].lng += ((Math.random() * randVal) - (randVal / 2));
		});
		res.send({
			err: null,
			res: result.rows
		});
	});
});

router.get('/stuff/id/:id', function(req, res) {
	if(req.isAuthenticated()) db.setEvent(2,'{{user}} viewed item {{post}}',req.session.passport.user.id, req.params.id);
	var query = [
		'SELECT posts.id, posts.title, posts.description, posts.attended,',
		'posts.lat, posts.lng, categories.category, images.image_url,',
		'posts.date_created, posts.date_edited',
		'FROM posts, images, categories',
		'WHERE images.post_id = posts.id AND posts.id = $1 AND',
		'categories.id = posts.category_id AND images.main = true'
	].join(' ');
	queryServer(res, query, [req.params.id], function(result) {
		var randVal = 0.0002;
		result.rows[0].lat += ((Math.random() * randVal) - (randVal / 2));
		result.rows[0].lng += ((Math.random() * randVal) - (randVal / 2));
		res.send({
			err: null,
			res: result.rows[0]
		});
	});
});

router.get('/stuff/my', isAuthenticated, function(req, res) {
	if(req.isAuthenticated()) db.setEvent(2,'{{user}} loaded their stuff', req.session.passport.user.id);
	queryServer(res, 'SELECT posts.title, users.uname, images.image_url, event.message, event.date_created FROM event, posts, users, images WHERE event.user_id1 = $1 AND users.id = event.user_id1 AND images.post_id = event.post_id AND posts.id = event.post_id AND level >= 3 AND event.message NOT LIKE \'%updated%\' ORDER BY event.date_created DESC LIMIT 10', [req.session.passport.user.id], function(result8) {
		result8.rows.forEach(function(e, i) {
			result8.rows[i].message = e.message.replace('{{user}}', '<i>'+result8.rows[i].uname+'</i>').replace('{{post}}', '<i>'+result8.rows[i].title+'</i>');
			result8.rows[i].date_created = new Date(e.date_created).toLocaleTimeString('en-us', {
				weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
			});
		});
		var query = [
			'SELECT posts.id, posts.title, posts.description, posts.archived,',
			'posts.expired, images.image_url, categories.category, posts.lat, posts.lng,',
			'posts.dibber_id, posts.date_edited, posts.attended FROM posts, images, categories WHERE',
			'(posts.user_id = $1 OR posts.dibber_id = $1) AND posts.archived = false AND',
			'images.post_id = posts.id AND images.main = true AND',
			'categories.id = posts.category_id AND ((posts.attended = true) OR (posts.date_created > now()::date - 3 AND posts.attended = false))'
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
														// test: testresult.rows,
														events: result8.rows
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
});

router.get('/stuff/my/id/:id', isAuthenticated, function(req, res) {
	db.setEvent(2,'{{user}} loaded {{post}}',req.session.passport.user.id, req.params.id);
	var query = [
		'SELECT posts.id, posts.dibbed, posts.user_id, posts.dibber_id, posts.user_id, posts.title, posts.description, posts.attended,',
		'posts.lat, posts.lng, categories.category, categories.id as category_id, images.image_url',
		'FROM posts, images, categories',
		'WHERE images.post_id = posts.id AND (posts.user_id = $1 OR posts.dibber_id = $1) AND',
		'posts.id = $2 AND categories.id = posts.category_id AND images.main = true'
	].join(' ');
	var values = [
		parseInt(req.session.passport.user.id),
		parseInt(req.params.id)
	];
	queryServer(res, query, values, function(result) {
		if (result.rows.length) {
			if (result.rows[0]) result.rows[0].type = (parseInt(result.rows[0].dibber_id) === parseInt(req.session.passport.user.id)) ? 'dibber' : 'lister';
			queryServer(res, 'SELECT id FROM conversations WHERE post_id = $1 AND archived = false', [result.rows[0].id], function (result2) {
				if (result2.rows.length) result.rows[0].conversation_id = result2.rows[0].id;
				queryServer(res, 'SELECT id, uname FROM users WHERE id = $1 OR id = $2', [result.rows[0].user_id, result.rows[0].dibber_id], function (result3) {
					if (result3.rows.length) {
						var tmp = {};
						result3.rows.forEach(function (e) {
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
		}
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
		db.setEvent(3,'{{user}} uploaded {{post}}',req.session.passport.user.id, result.rows[0].id);
		if(req.body.test && req.body.original) {
			var query = [
				'INSERT INTO images',
				'(post_id, image_url, main)',
				'VALUES ($1, $2, true)'
			].join(' ');
			var time = Date.now().toString();
			var buff = new Buffer(req.body.test.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
			var buff2 = new Buffer(req.body.original.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
			fs.writeFile(__dirname + '/../../../uploads/original/'+time+'.png', buff, function(err) {
				fs.writeFile(__dirname + '/../../../uploads/original/'+time+'_original.png', buff2, function(err) {
					fs.readFile(__dirname + '/../../../uploads/original/'+time+'.png', function(err, data) {
						fs.readFile(__dirname + '/../../../uploads/original/'+time+'_original.png', function(err, data2) {
							var key = 'posts/' + time;
							var key2 = 'posts/' + time + '_original';
							s3.upload({
								Bucket: 'stuffmapper-v2',
								Key: key,
								Body: data,
								ContentEncoding: 'base64',
								ContentType:'image/png',
								ACL: 'public-read'
							}, function(err, data) {
								if (err) {
									console.log('Error uploading data: ', err);
									res.send('Error uploading data: ', err);
									return;
								}
								s3.upload({
									Bucket: 'stuffmapper-v2',
									Key: key2,
									Body: data2,
									ContentEncoding: 'base64',
									ContentType:'image/png',
									ACL: 'public-read'
								}, function(err, data) {});
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
									queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [result.rows[0].id], function(result5) {
										queryServer(res, 'SELECT uname, email FROM users WHERE id = $1', [req.session.passport.user.id], function(result0) {
											sendTemplate(
												'item-listed',
												'Your '+req.body.title+' has been mapped!',
												{[result0.rows[0].uname]:result0.rows[0].email},
												{
													'FIRSTNAME' : result0.rows[0].uname,
													'ITEMTITLE' : req.body.title,
													'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url
												}
											);
										});
									});
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

router.post('/stuff/:id', isAuthenticated, function(req, res) {
	db.setEvent(3,'{{user}} updated {{post}}',req.session.passport.user.id, req.params.id);
	var query = [
		'UPDATE posts SET title = $2, description = $3, lat = $4, lng = $5,',
		'category_id = $6, date_edited = current_timestamp WHERE id = $7 AND user_id = $1',
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
	db.setEvent(3,'You deleted {{post}}',req.session.passport.user.id, req.params.id);
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
	var query = 'SELECT * FROM categories order by id asc';
	queryServer(res, query, [], function(result) {
		res.send({
			err: null,
			res: result.rows
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
		// console.log(req.session);
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
				// console.log(err, response);
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
						db.setEvent(1,'{{user}} joined Stuffmapper!',result.rows[0].id);
						sendTemplate(
							'email-verification',
							'Stuffmapper needs your confirmation!',
							{[uname]:b.email},
							{
								'FIRSTNAME' : uname,
								'CONFIRMEMAIL' : config.subdomain+'/stuff/get?email_verification_token=' + result.rows[0].verify_email_token,
								'ITEMIMAGE' : config.subdomain+'/img/give-pic-©-01.png'
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
			'RETURNING email, id'
		].join(' ');
		var values = [
			req.body.emailVerificationToken,
		];
		queryServer(res, query, values, function(result) {
			if(result.rows.length >= 1) {
				db.setEvent(1,'{{user}} verified their account',result.rows[0].id);
				res.send({err:null,res:result.rows[0].email});
			}
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
					'CHANGEPASSWORD' : config.subdomain+'/stuff/get?password_reset_token='+row.password_reset_token
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
				if(result.rows.length >= 1) {
					db.setEvent(1, '{{user}} updated their password', result.rows[0].id);
					res.send({err:null});
				}
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
			'RETURNING email, id'
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
	db.setEvent(2, '{{user}} signed out', req.session.passport.user.id);
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

router.delete('/account', isAuthenticated, function(req, res) {
	queryServer(res, 'SELECT count(*) FROM pick_up_success', [req.session.passport.user.id],function(result0) {
		if(result0.rows[0].count > 0) {
			return res.send({success:false});
		}
		queryServer(res, 'UPDATE users SET archived = true WHERE id = $1', [req.session.passport.user.id], function(result1) {
			queryServer(res, 'UPDATE posts SET archived = true WHERE user_id = $1', [req.session.passport.user.id], function(result2) {
				res.send({success:true});
			});
		});
	});
});



/* GOOGLE OAUTH -  END  */

/* OAUTH2.0 -  END  */


/* USER ACCOUNT MANAGEMENT -  END  */







/* DIBS MANAGEMENT - START */


router.post('/dibs/:id', isAuthenticated, function(req, res) {
	queryServer(res, 'UPDATE posts SET dibber_id = $1, dibbed = true WHERE dibbed = false AND id = $2 RETURNING *', [req.session.passport.user.id,req.params.id], function(result1) {
		queryServer(res, 'SELECT email FROM users WHERE id = $1', [req.session.passport.user.id], function(result0) {
			if(result1.rows[0].attended) {

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
					if(err) return res.send('failure');
					db.setEvent(2, '{{user}} dibs\'d {{post}}', req.session.passport.user.id, req.params.id);
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
							queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function(result4) {
								sendTemplate(
									result1.rows[0].attended?'dibber-notification-1':'dibber-notification-unattended',
									'You Dibs\'d an item!',
									{[(req.session.passport.user.uname)]: req.session.passport.user.email},
									{
										'FIRSTNAME' : req.session.passport.user.uname,
										'CHATLINK' : config.subdomain+'/stuff/my/items/'+req.params.id+'/messages',
										'MYSTUFFLINK' : config.subdomain+'/stuff/my/items/'+req.params.id,
										'ITEMTITLE':result1.rows[0].title,
										'ITEMIMAGE':'https://cdn.stuffmapper.com'+result4.rows[0].image_url
									}
								);
							});
						});
					});
				});
			} else {
				db.setEvent(2, '{{user}} dibs\'d {{post}}', req.session.passport.user.id, req.params.id);
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
						queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function(result4) {
							sendTemplate(
								result1.rows[0].attended?'dibber-notification-1':'dibber-notification-unattended',
								'You Dibs\'d an item!',
								{[(req.session.passport.user.uname)]: req.session.passport.user.email},
								{
									'FIRSTNAME' : req.session.passport.user.uname,
									'ITEMURL' : config.subdomain+'/stuff/my/items/'+req.params.id,
									'CHATLINK' : config.subdomain+'/stuff/my/items/'+req.params.id+'/messages',
									'MYSTUFFLINK' : config.subdomain+'/stuff/my/items/'+req.params.id,
									'ITEMTITLE':result1.rows[0].title,
									'ITEMIMAGE':'https://cdn.stuffmapper.com'+result4.rows[0].image_url
								}
							);
						});
					});
				});
			}
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
		queryServer(res, 'UPDATE posts SET archived = true WHERE id = $1', [req.params.id], function(result0) {
			/*lister*/ db.setEvent(3, 'Dibs complete - you gave {{post}}!', result1.rows[0].user_id, req.params.id);
			/*dibber*/ db.setEvent(3, 'Dibs complete - you received {{post}}!', result1.rows[0].dibber_id, req.params.id);
			res.send({
				err: null,
				res: {success: (result1.rows.length === 1)}
			});
			queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function(result2) {
				[result1.rows[0].dibber_id, result1.rows[0].user_id].forEach(function(e){
					queryServer(res, 'SELECT email, uname FROM users WHERE id = $1', [e], function(result3) {
						sendTemplate(
							'dibs-complete',
							'Dibs for '+result1.rows[0].title+' is complete!',
							{[result3.rows[0].uname]:result3.rows[0].email},
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
		db.setEvent(3, 'Your {{post}} was unDibs\'d', result1.rows[0].user_id, req.params.id);
		db.setEvent(3, 'You unDibs\'d {{post}}', req.session.passport.user.id, req.params.id);
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
			queryServer(res, query, [req.params.id], function(result3) {
				res.send({
					err: null,
					res: {
						'res1': result1.rows,
						'res2': result2.rows,
						'res3': result3.rows
					}
				});
				queryServer(res, 'select posts.attended from posts where id = $1', [req.params.id], function (result6) {
					if(result6.rows[0].attended) {
						queryServer(res, 'SELECT uname, email FROM users WHERE id = $1', [result1.rows[0].user_id], function (result4) {
							queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [req.params.id], function (result5) {
								var emailTo = {[result4.rows[0].uname]: result4.rows[0].email};
								sendTemplate(
									'notify-undib',
									'Your item has been unDibs\'d',
									emailTo,
									{
										'FIRSTNAME': result4.rows[0].uname,
										'USERNAME': req.session.passport.user.uname,
										'MYSTUFFLINK': 'http://' + config.subdomain + '/stuff/my/items/' + result1.rows[0].id,
										'ITEMTITLE': result1.rows[0].title,
										'ITEMIMAGE': 'https://cdn.stuffmapper.com' + result5.rows[0].image_url
									}
								);
							});
						});
					} else {
						res.status(200).end();
					}
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
			db.setEvent(3, 'You rejected the Dibs for {{post}}', req.session.passport.user.id, req.params.id);
			db.setEvent(3, 'Your Dibs for {{post}} was cancelled', result0.rows[0].dibber_id, req.params.id);
			query = [
				'UPDATE pick_up_success SET undibbed = true, rejected = true, undibbed_date = current_timestamp, rejection_date = current_timestamp',
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
				queryServer(res, query, [req.params.id], function(result3) {
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
							sendTemplate(
								'dibs-declined',
								'Your Dibs has been cancelled',
								{[result4.rows[0].uname] : result4.rows[0].email},
								{
									'FIRSTNAME' : result4.rows[0].uname,
									'ITEMTITLE':result1.rows[0].title,
									'ITEMNAME':result1.rows[0].title,
									'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url,
									'GETSTUFFLINK':config.subdomain
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
	queryServer(res, query, [req.session.passport.user.id], function(result1) {
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
	var values = [
		parseInt(req.body.conversation_id),
		req.session.passport.user.id,
		req.body.message
	];
	queryServer(res, 'INSERT INTO messages(conversation_id, user_id, message) values($1, $2, $3) RETURNING *', values, function(result) {
		queryServer(res, 'SELECT conversations.lister_id, conversations.dibber_id, messages.user_id, conversations.post_id FROM messages, conversations where conversations.id = $1 and messages.conversation_id = $1 and conversations.dibber_id = messages.user_id', [parseInt(req.body.conversation_id)], function(result1) {
			console.log(result1.rows);
			if(result1.rows.length === 1 && parseInt(result1.rows[0].lister_id) !== parseInt(req.session.passport.user.id)) {
				queryServer(res, 'SELECT uname, email FROM users WHERE id = $1', [result1.rows[0].lister_id], function(result2){
					queryServer(res, 'SELECT uname, email FROM users WHERE id = $1', [result1.rows[0].dibber_id], function(result0){
						queryServer(res, 'SELECT * FROM posts WHERE id = $1', [result1.rows[0].post_id],function(result3) {
							queryServer(res, 'SELECT image_url FROM images WHERE post_id = $1 AND main = true', [result1.rows[0].post_id], function(result4) {
								queryServer(res, 'SELECT message FROM messages WHERE user_id = $1 AND conversation_id = $2 ORDER BY date_created DESC', [req.session.passport.user.id, parseInt(req.body.conversation_id)], function(result5) {
									var messages = [];
									result5.rows.forEach(function(e) {
										messages.unshift(e.message);
									});
									sendTemplate(
										'lister-notification',
										'Your '+result3.rows[0].title + ' has been Dibs\'d!',
										{[result2.rows[0].uname]:result2.rows[0].email},
										{
											'FIRSTNAME' : result2.rows[0].uname,
											'USERNAME' : result0.rows[0].uname,
											'MESSAGE' : messages.join('<br>'),
											'ITEMTITLE' : result3.rows[0].title,
											'ITEMNAME' : result3.rows[0].title,
											'ITEMIMAGE' : 'https://cdn.stuffmapper.com'+result4.rows[0].image_url,
											'CHATLINK' : config.subdomain+'/stuff/my/items/'+result1.rows[0].post_id+'/messages'
										}
									);
								});
							});
						});
					});
				});
			}
			res.send({
				err: null,
				res: result.rows
			});
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
	queryServer(res, query, [req.params.post_id], function(result1) {
		if(result1.rows.length) {
			var query = [
				'SELECT messages.user_id, messages.message, messages.date_created,',
				// 'SELECT messages.user_id, messages.message, TO_CHAR(messages.date_created, \'HH:MIam – DD Mon YYYY TZ\') as date_created,',
				'messages.read FROM messages WHERE messages.conversation_id = $1 AND',
				'messages.archived = false ORDER BY messages.date_created DESC'
			].join(' ');
			queryServer(res, query, [result1.rows[0].id], function (result) {
				queryServer(res, 'SELECT id, uname FROM users WHERE id = $1 OR id = $2', [result1.rows[0].lister_id, result1.rows[0].dibber_id], function (result3) {
					if (result3.rows.length) {
						var tmp = {};
						result3.rows.forEach(function (e) {
							tmp[e.id] = e.uname;
						});
						var inboundMessenger = parseInt(result1.rows[0].lister_id);
						if (result1.rows[0].dibber_id !== parseInt(req.session.passport.user.id)) {
							inboundMessenger = parseInt(result1.rows[0].dibber_id);
						}
						result.rows.forEach(function (e, i) {
							result.rows[i].type = ((parseInt(result.rows[i].user_id) === parseInt(req.session.passport.user.id)) ? 'out' : 'in');
						});
						console.log(result.rows);
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
									type: ((result1.rows[0].dibber_id === parseInt(req.session.passport.user.id)) ? ('dibber') : ('lister')),
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
		}
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
