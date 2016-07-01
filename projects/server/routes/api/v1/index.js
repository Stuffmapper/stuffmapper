var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var passport = require('passport');
var request = require('request');

var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper';

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
			'SELECT posts.id, posts.title, posts.description, posts.attended, ',
			'posts.lat, posts.lng, categories.category, images.image_url ',
			'FROM posts, images, categories WHERE images.post_id = posts.id AND ',
			'categories.id = posts.category_id AND posts.dibbed = false'
		].join('');
		client.query(query, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
			result.rows.forEach(function(e, i) {
				result.rows[i].lat += ((Math.random() * 0.002) - 0.001);
				result.rows[i].lng += ((Math.random() * 0.002) - 0.001);
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
			'SELECT posts.id, posts.title, posts.description, posts.attended, ',
			'posts.lat, posts.lng, categories.category, images.image_url ',
			'FROM posts, images, categories ',
			'WHERE images.post_id = posts.id AND posts.id = $1 AND ',
			'categories.id = posts.category_id AND posts.dibbed = false'
		].join('');
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
		'SELECT * FROM posts WHERE user_id = $1 AND dibber_id = $1 AND ',
		'archived = false AND images.post_id = posts.id;'
	].join('');
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
			'SELECT posts.id, posts.title, posts.description, posts.attended, ',
			'posts.lat, posts.lng, categories.category, images.image_url FROM posts, ',
			'images, categories',
			'WHERE images.post_id = posts.id AND posts.user_id = $1 AND ',
			'posts.id = $2 AND categories.id = posts.category_id'
		].join('');
		var values = [
			req.session.passport.user.id,
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
			'INSERT INTO posts ',
			'(user_id, title, description, lat, lng, attended, category_id) ',
			'VALUES ($1, $2, $3, $4, $5, $6, $7) ',
			'RETURNING id'
		].join('');
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
			var query = [
				'INSERT INTO images ',
				'(post_id, image_url, main) ',
				'VALUES ($1, $2, $3)'
			].join('');
			var values = [
				result.rows[0].id,
				'/'+req.file.key,
				true
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

router.put('/stuff/id/:id', isAuthenticated, function(req, res) {
	var stuff = [];
	if(req.params.id <= db.users.length) {
		var uname = db.users[req.params.id-1].uname;
		res.json(db.stuff[uname]);
	}
	else {
		res.json({
			err : {
				message : 'Could not update stuff.',
				redirect : false
			}
		});
	}
});

router.delete('/stuff/id/:id', isAuthenticated, function(req, res) {
	var stuff = [];
	if(req.params.id <= db.users.length) {
		var uname = db.users[req.params.id-1].uname;
		res.json(db.stuff[uname]);
	}
	else {
		res.json({
			err: {
				mesage : 'Could not delete stuff',
				redirect : true
			}
		});
	}
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
	if(req.isAuthenticated()) {
		res.send({
			err: null,
			res: {
				user: req.session.passport.user
			}
		});
	}
	else {
		apiError(res, 'not logged in');
	}
});

router.post('/account/register', function(req, res) {
	var client = new pg.Client(conString);
	var b = req.body;
	console.log(b);
	if(b.type === 'google') {
		console.log('alskfjlaskjfsadlkfjsdalfkjsdfkj');
		request({
			method: 'GET',
			url:'https://www.googleapis.com/oauth2/v2/userinfo?fields=email%2Cfamily_name%2Cgiven_name%2Cpicture&key='+b.oauth.id_token,
			headers: {
				'Authorization':'Bearer '+b.oauth.access_token
			}
		}, function(data) {
			console.log('AHHHHHHH I DID IT AHHHHHHHHHH', data);
		});
	}
	else if(b.type === 'facebook') {

	}
	else {
		bcrypt.hash(b.password, saltRounds, function(err, hashedPassword) {
			var query = [
				'INSERT INTO users ',
				'(fname, lname, uname, email, password, phone_number) ',
				'VALUES ($1, $2, $3, $4, $5, $6) ',
				'RETURNING *'
			].join('');
			var values = [
				b.fname,
				b.lname,
				b.uname,
				b.email,
				hashedPassword,
				b.phone_number
			];
			queryServer(res, query, values, function(result) {
				res.send({
					err : null,
					res : {
						redirect: true
					}
				});
			});
		});
	}
});

router.post('/account/login', function(req, res, next) {
	var passport = req._passport.instance;
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return res.send({
				err: 'local login error: ' + err,
				res: {
					isValid: false
				}
			});
		}
		if (!user) {
			return res.send({
				err: 'user does not exist',
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

router.get('/account/login/facebook', passport.authenticate('facebook', {
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
	// ARCHIVE DO NOT DELETE
	// auto sign out when complete
	var id = req.session.passport.user.id;

});



/* GOOGLE OAUTH -  END  */

/* OAUTH2.0 -  END  */


/* USER ACCOUNT MANAGEMENT -  END  */

/* DIBS MANAGEMENT - START */

router.post('/dibs/:id', isAuthenticated, function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'UPDATE posts SET dibber_id = $1, dibbed = true ',
			'WHERE dibbed = false AND id = $2 ',
			'RETURNING *'
		].join('');
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
				'INSERT INTO pick_up_success ',
				'(post_id, dibber_id, lister_id) ',
				'VALUES ($1, $2, $3) RETURNING *'
			].join('');
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
				var query = [
					'INSERT INTO conversations ',
					'(post_id, dibber_id, lister_id) ',
					'VALUES ($1, $2, $3) RETURNING *'
				].join('');
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
					return client.end();
				});
			});
		});
	});
});

router.delete('/undib/:id', isAuthenticated, function(req, res) {

});

router.delete('/dibs/reject/:id', isAuthenticated, function(req, res) {

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
					'ORDER BY messages.date_created DESC LIMIT 1'
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

router.get('/conversation/:id', isAuthenticated, function(req, res) {
	var query = [
		'SELECT * FROM messages WHERE conversation_id = $1',
		'ORDER BY date_created DESC'
	].join(' ');
	var values = [
		req.params.id
	];
	queryServer(res, query, values, function(result) {
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
			'WHERE user_id = $1 AND watchlist_keys.watchlist_item = watchlist_items.id'
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
			client.query("SELECT id FROM categories WHERE category = $1", [e], function(err, result1) {
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


module.exports = router;
