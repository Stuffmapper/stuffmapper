var AWS = require('aws-sdk');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient();
var sharedsession = require('express-socket.io-session');
var passport = require('passport');
var User = require('./routes/api/v1/config/user');
var stage = process.env.STAGE || 'development';
var config = require('./config')[stage];
var port = process.env.PORT || config.port || 3000;
var multer = require('multer');
var multerS3 = require('multer-s3');
var braintree = require('braintree');
var proxy = require('express-http-proxy');
var pg = require('pg');
var pgUser = config.db.user;
var pgDb = config.db.db;
var pgPass = config.db.pass;
var pgHost = config.db.host;
var pgPort = config.db.port;
var conString = 'postgres://'+pgUser+':'+pgPass+'@'+pgHost+':'+pgPort+'/'+pgDb;
AWS.config.update( {
	accessKeyId     : config.aws.accessKeyId,
	secretAccessKey : config.aws.secretAccessKey,
	region          : config.aws.region
});
var s3 = new AWS.S3({Bucket: config.aws.bucket});
var util = require('./util.js');
var db = new util.db();
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(multer({
	limits: { fieldSize: 15000000 },
	storage: multerS3({
		s3: s3,
		bucket: 'stuffmapper-v2',
		acl: 'public-read',
		metadata: function (req, file, cb) {
			cb(null, {fieldName: file.fieldname});
		},
		key: function (req, file, cb) {
			cb(null, 'posts/' + Date.now().toString());
		}
	})
}).single('file'));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});
app.use(cookieParser('SuperSecretPassword1!'));
var newSession = session({
	cookie: {
		maxAge: 360000000,
		httpOnly: true
	},
	store: new redisStore({ host: 'localhost', port: 6379, client: client }),
	secret: 'SuperSecretPassword1!',
	saveUninitialized: true,
	resave: true
});
app.use(newSession);
io.use(sharedsession(newSession, cookieParser('SuperSecretPassword1!')));
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'jade');

// app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '15mb', type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));
app.use('/', express.static(path.join(__dirname, 'favicons')));
app.use('/', express.static(path.join(__dirname, 'web')));

require(path.join(__dirname, '/routes/api/v1/config/passport'));

app.use(passport.initialize());
app.use(passport.session());

var gateway = braintree.connect({
	environment: braintree.Environment.Production,
	merchantId: '7t82byzdjdbkwp8m',
	publicKey: '5hnt7srpm7x5d2qp',
	privateKey: '6f8520869e0dd6bf8eec2956752166d9'
});

app.post('/checkout/paiddibs', function(req, res) {
	var nonceFromTheClient = req.body.payment_method_nonce;
	console.log('nonce',nonceFromTheClient);
	if(!nonceFromTheClient) return res.send('failure');
	gateway.transaction.sale({
		amount: '1.00',
		paymentMethodNonce: nonceFromTheClient,
		options: {
			verifyCard: true
		},
		deviceData: req.body.device_data
	}, function (err, result) {
		console.log(err, result);
		if(err) return res.send('failure');
		res.send('success');
	});
});

app.get('/redirect',function(req,res){res.render('redirect');});

app.get('/auth/google_oauth2/callback', function(req,res,next) {
	passport.authenticate('google', function(err, user, info) {
		if(err && err.message === 'account exists') {
			return res.send([
				'<html><head><title>Sign In</title><link rel="stylesheet" href="/js/lib/normalize-css/normalize.css" /><link rel="stylesheet" href="/js/lib/animate.css/animate.min.css" /><link rel="stylesheet" href="/css/main.css" /><link rel="stylesheet" href="/css/main.app.min.css" /><link rel="stylesheet" href="/js/lib/bootstrap/dist/css/bootstrap.min.css" /><link rel="stylesheet" href="/css/font-awesome.min.css" /><script src="https://use.typekit.net/lrm3jdv.js"></script><script>try{Typekit.load({ async: true });}catch(e){}</script></head><body style="background-color: #33AEDC;">',
				'<div class="modal-window">',
				'	<div class="modal-header"></div>',
				'	<div id="modal-close-button" class="modal-close"><i class="fa fa-close" style="line-height: 48px; height: 100%;"></i></div>',
				'	<div class="sm-modal-content">',
				'		<div id="sign-in-step" class="modal-step animate-250 active">',
				'			<h2 class="sm-modal-title animate-250">Uh oh!</h2>',
				'			<div class="sm-modal-error sm-full-width sm-text-l" style="text-align: center;">It looks like you already signed up with a '+capitalizeFirstLetter(err.type)+' account: '+err.email+', not '+capitalizeFirstLetter(err.otherType)+'</div><br><br><br><br><div class="sm-full-width sm-text-m" style="text-align: center;">Sign in with your '+capitalizeFirstLetter(err.type)+' account below:</div>',
				((err.type==='google')?
				'			<a style="bottom: 10px;position: absolute;" href="'+config.subdomain+'/api/v1/account/login/google" class="sign-in-up-input social-button google-plus-sign-in"><img src="/img/google-g-logo.svg" class="social-sign-in-icon social-sign-in-icon-google"><span class="social-sign-in-text sm-text-m">Sign in with Google</span></a>':
				'			<a style="bottom: 10px;position: absolute; color: #fff !important;" href="'+config.subdomain+'/api/v1/account/login/facebook" class="sign-in-up-input social-button facebook-sign-in"><img src="/img/facebook-f-logo.svg" class="social-sign-in-icon social-sign-in-icon-facebook"><span class="social-sign-in-text sm-text-m">Sign in with Facebook</span></a>'),
				'		</div>',
				'	</div>',
				'</div>',
				'<script>document.getElementById("modal-close-button").addEventListener("click", function(){window.close();});</script>',
				'</body></html>'
			].join('\n'));
		}
		if (err) return res.send(err);
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.redirect('/redirect');
		});
	})(req,res,next);
});

app.get('/auth/facebook_oauth2/callback', function(req,res,next){
	passport.authenticate('facebook', { scope : ['id', 'displayName', 'public_profile', 'email'] }, function(err, user, info) {
		if(err && err.message === 'account exists') {
			return res.send([
				'<html><head><title>Sign In</title><link rel="stylesheet" href="/js/lib/normalize-css/normalize.css" /><link rel="stylesheet" href="/js/lib/animate.css/animate.min.css" /><link rel="stylesheet" href="/css/main.css" /><link rel="stylesheet" href="/css/main.app.min.css" /><link rel="stylesheet" href="/js/lib/bootstrap/dist/css/bootstrap.min.css" /><link rel="stylesheet" href="/css/font-awesome.min.css" /><script src="https://use.typekit.net/lrm3jdv.js"></script><script>try{Typekit.load({ async: true });}catch(e){}</script></head><body style="background-color: #33AEDC;">',
				'<div class="modal-window">',
				'	<div class="modal-header"></div>',
				'	<div id="modal-close-button" class="modal-close"><i class="fa fa-close" style="line-height: 48px; height: 100%;"></i></div>',
				'	<div class="sm-modal-content">',
				'		<div id="sign-in-step" class="modal-step animate-250 active">',
				'			<h2 class="sm-modal-title animate-250">Uh oh!</h2>',
				'			<div class="sm-modal-error sm-full-width sm-text-l" style="text-align: center;">It looks like you already signed up with a '+err.type+' account: '+err.email+', not '+err.otherType+'</div><br><br><br><br><div class="sm-full-width sm-text-m" style="text-align: center;">Sign in with your '+err.type+' account below:</div>',
				((err.type==='google')?
				'			<a style="bottom: 10px;position: absolute;" href="'+config.subdomain+'/api/v1/account/login/google" class="sign-in-up-input social-button google-plus-sign-in"><img src="/img/google-g-logo.svg" class="social-sign-in-icon social-sign-in-icon-google"><span class="social-sign-in-text sm-text-m">Sign in with Google</span></a>':
				'			<a style="bottom: 10px;position: absolute; color: #fff !important;" href="'+config.subdomain+'/api/v1/account/login/facebook" class="sign-in-up-input social-button facebook-sign-in"><img src="/img/facebook-f-logo.svg" class="social-sign-in-icon social-sign-in-icon-facebook"><span class="social-sign-in-text sm-text-m">Sign in with Facebook</span></a>'),
				'		</div>',
				'	</div>',
				'</div>',
				'<script>document.getElementById("modal-close-button").addEventListener("click", function(){window.close();});</script>',
				'</body></html>'
			].join('\n'));
		}
		if (err) return res.send(err);
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.redirect('/redirect');
		});
	})(req,res,next);
});

io.on('connection', function(socket){
	socket.on('message', function(data) {
		if(data.to) {
			queryServer('SELECT count(messages) FROM messages, conversations WHERE (conversations.lister_id = $1 OR conversations.dibber_id = $1) AND NOT messages.user_id = $1 AND messages.conversation_id = conversations.id AND conversations.archived = false AND messages.archived = false AND messages.read = false', [data.to], function(result) {
				io.sockets.emit((data.to), {
					messages: {
						message: data.message,
						from: data.from,
						conversation: data.conversation,
						unread:result.rows[0].count,
						title: data.title
					}
				});
			});
		}
	});
});
io.on('disconnect', function(socket){
	console.log('a user disconnected');
});
app.use('/api/v1', require('./routes/api/v1/index'));
app.use('*', function(req,res){
	res.render('index', {
		loggedIn : req.isAuthenticated(),
		isDev : true,
		config: config
	});
});

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

http.listen(port, function() {
	console.log('Listening on port ' + port);
});
process.on('SIGTERM', function() {
	http.close(function() {
		console.log('Closed all connections');
		process.exit();
	});
	setTimeout(function() {
		console.error('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 1000);
});
process.on('SIGINT', function() {
	console.log('\nAttempting to close all connections...');
	http.close(function() {
		console.log('Closed all connections');
		process.exit();
	});
	setTimeout(function() {
		console.error('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 1000);
});
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
function queryServer(query, values, cb) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) return client.end();
		client.query(query, values, function(err, result) {
			if(err) return client.end();
			client.end();
			cb(result);
		});
	});
}


var jobs = 1;
var completeJobs = 0;

setInterval(function() {
	var pgconfig = {
		user: pgUser,
		database: pgDb,
		password: pgPass,
		host: pgHost,
		port: 5432,
		max: 10,
		idleTimeoutMillis: 1000
	};
	var pool = new pg.Pool(pgconfig);
	pool.connect(function(err, client, done) {
		if(err) return console.error('error fetching client from pool', err);
		client.query('SELECT * FROM conversations WHERE archived = false', [], function(err, result1) {
			if(err) {
				done();
				return console.error('error running query', err);
			}
			var conversations = result1.rows.length;
			var conversation_counter = 0;
			result1.rows.forEach(function(e, i) {
				client.query('SELECT * FROM messages WHERE conversation_id = $1 AND archived = false ORDER BY date_created DESC LIMIT 1 ', [e.id], function(err,result2) {
					var lastMessage = result2.rows[0];
					var convTime = new Date(e.date_created).getTime();
					var messTime = lastMessage?new Date(lastMessage.date_created).getTime():0;
					var currTime = new Date().getTime();
					var convAgeMin = new Date(currTime - convTime).getUTCMinutes();
					var messAgeMin = new Date(currTime - messTime).getUTCMinutes();
					var dibberMessaged = false;
					result2.rows.forEach(function(f) {
						if(!dibberMessaged && (e.dibber_id === f.user_id)) dibberMessaged = true;
					});
					if((!lastMessage && !dibberMessaged) && convAgeMin >= 15) undib(e.post_id, e.dibber_id);
					else if(lastMessage && !lastMessage.emailed && messAgeMin === 3) messageUserMessageNotification(((lastMessage.user_id===e.lister_id)?e.dibber_id:e.lister_id), e.id, e.post_id);
					else if(lastMessage && messAgeMin === 24*60) messageUserMessageReminder(((lastMessage.user_id===e.lister_id)?e.dibber_id:e.lister_id), e.id, e.post_id);
					if(++conversation_counter === conversations) {jobsDone(done);done();}
				});
			});
		});
	});

	pool.on('error', function(err, client) {
		console.error('idle client error', err.message, err.stack);
	});
}, 1000*60*1); // ms * sec * min



function undib(post_id, user_id) {
	var pgconfig = {
		user: pgUser,
		database: pgDb,
		password: pgPass,
		host: pgHost,
		port: 5432,
		max: 10,
		idleTimeoutMillis: 1000
	};
	var pool = new pg.Pool(pgconfig);
	pool.connect(function(err, client, done) {
			var query = [
				'UPDATE posts SET dibber_id = NULL, dibbed = false',
				'WHERE dibbed = true AND attended = true AND id = $2 AND dibber_id = $1',
				'RETURNING *'
			].join(' ');
			var values = [
				user_id,
				post_id
			];
			client.query(query, values, function(err, result1) {
				if(err || result1.rows.length === 0) return done();
				var query = [
					'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
					'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3 RETURNING *'
				].join(' ');
				var values = [
					post_id,
					user_id,
					result1.rows[0].user_id
				];
				client.query(query, values, function(err, result2) {
					if(err) return done();
					var query = [
						'UPDATE conversations SET archived = true, date_edited = current_timestamp',
						'WHERE post_id = $1 RETURNING *'
					].join(' ');
					client.query(query, [post_id], function(err, result3) {
						if(err) return done();
						var query = 'SELECT uname, email FROM users WHERE id = $1';
						var values = [user_id];
						client.query(query, values, function(err, result4){
							if(err) return done();
							query = 'SELECT image_url FROM images WHERE post_id = $1 AND main = true';
							client.query(query, [post_id], function(err, result5) {
								if(err) return done();
								io.sockets.emit((''+user_id), {
									undibsd:post_id
								});
								db.setEvent(3,'Dibs for {{post}} cancelled; you did not send a message.',user_id, post_id);
								sendTemplate(
									'dibs-expired',
									'Your Dibs has expired',
									{[result4.rows[0].uname]:result4.rows[0].email},
									{
										'FIRSTNAME' : result4.rows[0].uname,
										'ITEMTITLE':result1.rows[0].title,
										'ITEMNAME':result1.rows[0].title,
										'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url,
										'GETSTUFFLINK':config.subdomain+'/stuff/get'
									}
								);
								done();
								return client.end();
							});
						});
					});
				});
		});
	});
}

function messageUserMessageNotification(user_id, conversation_id, post_id) {
	queryServer('SELECT * FROM messages WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false ORDER BY date_created ASC', [user_id, conversation_id], function(result1) {
		queryServer('SELECT uname, email FROM users WHERE id = $1', [user_id], function(result2){
			queryServer('UPDATE messages SET emailed = true WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false', [user_id, conversation_id], function(result10) {
				queryServer('SELECT title, id, dibber_id, user_id FROM posts WHERE id = $1', [post_id], function(result3) {
					queryServer('SELECT image_url FROM images WHERE post_id = $1 AND main = true', [post_id], function(result5) {
						queryServer('SELECT uname FROM users WHERE (id = $1 OR id = $2) AND NOT id = $3', [result3.rows[0].user_id, result3.rows[0].dibber_id, user_id], function(result6) {
							var test = [];
							result1.rows.forEach(function(e){test.push(e.message);});
							if(test.join('') && test.join('').trim()) {
								sendTemplate(
									'message-notification',
									'You received a message!',
									{[result2.rows[0].uname]:result2.rows[0].email},
									{
										'FIRSTNAME' : result2.rows[0].uname,
										'USERNAME' : result6.rows[0].uname,
										'ITEMTITLE':result3.rows[0].title,
										'ITEMNAME':result3.rows[0].title,
										'CHATLINK':config.subdomain+'/stuff/my/items/'+post_id+'/messages',
										'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url,
										'MESSAGE':test.join('<br>').trim()
									}
								);
							}
						});
					});
				});
			});
		});
	});
}

function messageUserMessageReminder(user_id, conversation_id, post_id) {
	queryServer('SELECT * FROM messages WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false ORDER BY date_created ASC', [user_id, conversation_id], function(result1) {
		queryServer('SELECT uname, email FROM users WHERE id = $1', [user_id], function(result2){
			queryServer('UPDATE messages SET emailed = true WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false', [user_id, conversation_id], function(result10) {
				queryServer('SELECT title, id, dibber_id, user_id FROM posts WHERE id = $1', [post_id], function(result3) {
					queryServer('SELECT image_url FROM images WHERE post_id = $1 AND main = true', [post_id], function(result5) {
						queryServer('SELECT uname FROM users WHERE (id = $1 OR id = $2) AND NOT id = $3', [result3.rows[0].user_id, result3.rows[0].dibber_id, user_id], function(result6) {
							var test = [];
							result1.rows.forEach(function(e){test.push(e.message);});
							if(test.join('') && test.join('').trim()) {
								sendTemplate(
									'message-reminder',
									'Reminder: You received a message!',
									{[result2.rows[0].uname]:result2.rows[0].email},
									{
										'FIRSTNAME' : result2.rows[0].uname,
										'USERNAME' : result6.rows[0].uname,
										'ITEMTITLE':result3.rows[0].title,
										'ITEMNAME':result3.rows[0].title,
										'CHATLINK':config.subdomain+'/stuff/my/items/'+post_id+'/messages',
										'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url,
										'MESSAGE':test.join('<br>').trim()
									}
								);
							}
						});
					});
				});
			});
		});
	});
}

function jobsDone() {
	if(++completeJobs === jobs) {
		if(arguments) {
			for(var i = 0; i < Object.keys(arguments).length; i++) {
				if(typeof arguments[i] === 'function') process.nextTick(arguments[i]);
			}
		}
	}
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
			'email': to[e],
			'name': e,
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
