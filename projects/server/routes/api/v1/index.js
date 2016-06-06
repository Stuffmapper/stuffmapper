var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var upload = require('multer')({ dest: 'uploads/' });
var passport = require('passport');

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

var verifier = function(template, body) {
	var templateKeys = Object.keys(template);
	var bodyKeys = Object.keys(body);

};
//var authenticator = require('stuff_authenticator');

/* STUFF MANAGEMENT - START */
router.get('/stuff', function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT posts.id, posts.title, posts.description, posts.attended, posts.lat, posts.lng, categories.category, ',
			'images.image_url ',
			'FROM posts, images, categories WHERE images.post_id = posts.id AND categories.id = posts.category_id'
		].join('');
		client.query(query, function(err, result) {
			if(err) {
				apiError(res, err);
				return client.end();
			}
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
			'SELECT posts.id, posts.title, posts.description, posts.attended, posts.lat, posts.lng, categories.category, ',
			'images.image_url from posts, images, categories WHERE ',
			'images.post_id = posts.id AND posts.id = $1 AND categories.id = posts.category_id'
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

router.get('/stuff/my/id/:id', isAuthenticated, function(req, res) {
	var id = req.params.id;
	var user = req.session.passport.user.id;
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT posts.id, posts.title, posts.description, posts.attended, posts.lat, posts.lng, categories.category, ',
			'images.image_url FROM posts, images, categories WHERE ',
			'images.post_id = posts.id AND posts.user_id = $1 AND posts.id = $2 AND categories.id = posts.category_id'
		].join('');
		var values = [
			user,
			id
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
router.get('/stuff/bounds/:nwlat/:nwlng/:nelat/:nelng/:swlat/:swlng/:selat/:selng', function(req, res) {

});
router.post('/stuff', isAuthenticated, function(req, res) {// /img/uploads/
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
	res.send({
		err: null,
		res: {
			loggedIn: req.isAuthenticated(),
			admin: false
		}
	});
});

router.post('/account/register', function(req, res) {
	var client = new pg.Client(conString);
	var body = req.body;
	bcrypt.hash(body.password, saltRounds, function(err, hashedPassword) {
		client.connect(function(err) {
			if(err) {
				client.end();
				return;
			}
			var query = [
				'INSERT INTO users ',
				'(fname, lname, uname, email, password, phone_number) ',
				'VALUES ($1, $2, $3, $4, $5, $6) ',
				'RETURNING *'
			].join('');
			var values = [
				body.fname,
				body.lname,
				body.uname,
				body.email,
				hashedPassword,
				body.phone_number
			];
			client.query(query, values, function(err, result) {
				if(err) {
					res.send({
						err : {
							message : err,
							redirect : false
						}
					});
					client.end();
				} else {
					res.send({
						err : null,
						res : {
							redirect: true
						}
					});
				}
			});
		});
	});
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

/* GOOGLE OAUTH -  END  */

/* OAUTH2.0 -  END  */


/* USER ACCOUNT MANAGEMENT -  END  */

/* DIBS MANAGEMENT - START */

router.post('/dibs/:id', isAuthenticated, function(req, res) {

});

/* DIBS MANAGEMENT -  END  */

/* MESSAGING MANAGEMENT - START */

router.get('/messages', isAuthenticated, function(req, res) {
	var query = [
		'SELECT messages.message, users.uname, messages.date_created FROM messages ORDER BY date_created DESC LIMIT 1, ',
		'conversations ORDER BY date_created DESC LIMIT 15, users ',
		'WHERE users.id = messages.user_id AND ',
		'conversations.id = messages.conversation_id AND ',
		'users.id = $1'
	].join('');
	var values = [
		req.session.passport.user.id
	];
	queryServer(res, query, value, function(result) {
		res.send({
			err: null,
			res: result
		});
	});
});

router.post('/messages', isAuthenticated, function(req, res) {
	var body = req.body;
	var query = [
		'INSERT INTO messages(messages.user_id, messages.conversation_id, messages.message) ',
		'values($1, $2, $3) WHERE conversations.id = $2 AND ',
		'(conversations.lister_id = $1 OR conversations.dibber_id = $1) AND ',
		'conversations.date_created = $3'
	].join('');
	var values = [
		req.session.passport.user.id,
		body.conversation_id,
		body.message,
		body.date_created
	];
	queryServer(res, query, value, function(result) {
		res.send({
			err: null,
			res: result
		});
	});
});

router.put('/messages/:id', isAuthenticated, function(req, res) {

});

router.delete('/messages/:id', isAuthenticated, function(req, res) {

});

/* MESSAGING MANAGEMENT -  END  */


/* WATCHLIST MANAGEMENT - START */

router.get('/watchlist/:userid', isAuthenticated, function(req, res) {
	//return all watchlist items
});

router.get('/watchlist/:userid/:id', isAuthenticated, function(req, res) {
	//return watchlist item
});

router.post('/watchlist/:userid', isAuthenticated, function(req, res) {
	//add watchlist item
});

router.put('/watchlist/:userid/:id', isAuthenticated, function(req, res) {
	//update watchlist item
});

router.delete('/watchlist/:userid/:id', isAuthenticated, function(req, res) {
	//archive watchlist item
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
		'UPDATE users SET uname = $2, fname = $3, lname = $4, ',
		'phone_number = $5, email = $6, address = $7, city = $8, ',
		'state = $9, zip_code = $10, country = $11 ',
		'WHERE id = $1 RETURNING *'
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
