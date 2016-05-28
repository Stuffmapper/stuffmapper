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
//select posts.title, posts.description, images.image_url from posts, images where images.post_id = posts.id;
router.get('/stuff', function(req, res) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'SELECT posts.id, posts.title, posts.description, posts.attended, posts.lat, posts.lng, ',
			'images.image_url ',
			'from posts, images where images.post_id = posts.id'
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
		});
	});
});

router.get('/stuff/:id', function(req, res) {
	req.db.get('stuff', {}, { id : req.params.id }, function(err, result) {
		res.json(result);
	});
});

router.get('/stuff/:userId/:id', function(req, res) {
	req.db.get('stuff', {}, { userId : req.params.userId, id: req.params.id }, function(err, result) {
		res.json(result);
	});
});

router.post('/stuff', function(req, res) {// /img/uploads/
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			apiError(res, err);
			return client.end();
		}
		var query = [
			'INSERT INTO posts ',
			'(user_id, title, description, lat, lng, attended) ',
			'VALUES ($1, $2, $3, $4, $5, $6) ',
			'RETURNING id'
		].join('');
		var values = [
			req.session.passport.user.id,
			req.body.title,
			req.body.description,
			req.body.lat,
			req.body.lng,
			req.body.attended
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
			});
		});
	});
});

router.put('/stuff/:id', isAuthenticated, function(req, res) {
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

router.delete('/stuff/:id', isAuthenticated, function(req, res) {
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

});

router.post('/messages', isAuthenticated, function(req, res) {

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

module.exports = router;
