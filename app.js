var AWS = require('aws-sdk');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
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
var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper2';
AWS.config = new AWS.Config();
AWS.config.accessKeyId = 'AKIAJQZ2JZJQHGJV7UBQ';
AWS.config.secretAccessKey = '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';
var s3 = new AWS.S3({Bucket:'stuffmapper-v2',region:'us-west-2'});
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(multer({
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
		maxAge: 36000000
	},
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
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
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
	if(!nonceFromTheClient) return res.send('failure');
	gateway.transaction.sale({
		amount: '1.00',
		paymentMethodNonce: nonceFromTheClient,
		options: {
	    verifyCard: true
		},
	  deviceData: req.body.device_data
	}, function (err, result) {
		if(err) return res.send('failure');
		res.send('success');
	});
});

app.get('/redirect',function(req,res){res.render('redirect');});

app.get('/auth/google_oauth2/callback', function(req,res,next) {
	passport.authenticate('google', function(err, user, info) {
		if(err && err.message === 'account exists') {
			return res.send([
				'<html><head><title>Sign In</title><link rel="stylesheet" href="/js/lib/normalize-css/normalize.css" /><link rel="stylesheet" href="/js/lib/animate.css/animate.min.css" /><link rel="stylesheet" href="/styleguide/css/main.css" /><link rel="stylesheet" href="/css/main.app.min.css" /><link rel="stylesheet" href="/js/lib/bootstrap/dist/css/bootstrap.min.css" /><link rel="stylesheet" href="/css/font-awesome.min.css" /><script src="https://use.typekit.net/lrm3jdv.js"></script><script>try{Typekit.load({ async: true });}catch(e){}</script></head><body style="background-color: #33AEDC;">',
				'<div class="modal-window">',
				'	<div class="modal-header"></div>',
				'	<div id="modal-close-button" class="modal-close"><i class="fa fa-close" style="line-height: 48px; height: 100%;"></i></div>',
				'	<div class="sm-modal-content">',
				'		<div id="sign-in-step" class="modal-step animate-250 active">',
				'			<h2 class="sm-modal-title animate-250">Uh oh!</h2>',
				'			<div class="sm-modal-error sm-full-width sm-text-l" style="text-align: center;">It looks like you already signed up with a '+err.type+' account: '+err.email+', not '+err.otherType+'</div><br><br><br><br><div class="sm-full-width sm-text-m" style="text-align: center;">Sign in with your '+err.type+' account below:</div>',
				((err.type==='google')?
				'			<a style="bottom: 10px;position: absolute;" href="https://'+config.subdomain+'.stuffmapper.com/api/v1/account/login/google" class="sign-in-up-input social-button google-plus-sign-in"><img src="/img/google-g-logo.svg" class="social-sign-in-icon social-sign-in-icon-google"><span class="social-sign-in-text sm-text-m">Sign in with Google</span></a>':
				'			<a style="bottom: 10px;position: absolute; color: #fff !important;" href="https://'+config.subdomain+'.stuffmapper.com/api/v1/account/login/facebook" class="sign-in-up-input social-button facebook-sign-in"><img src="/img/facebook-f-logo.svg" class="social-sign-in-icon social-sign-in-icon-facebook"><span class="social-sign-in-text sm-text-m">Sign in with Facebook</span></a>'),
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
				'<html><head><title>Sign In</title><link rel="stylesheet" href="/js/lib/normalize-css/normalize.css" /><link rel="stylesheet" href="/js/lib/animate.css/animate.min.css" /><link rel="stylesheet" href="/styleguide/css/main.css" /><link rel="stylesheet" href="/css/main.app.min.css" /><link rel="stylesheet" href="/js/lib/bootstrap/dist/css/bootstrap.min.css" /><link rel="stylesheet" href="/css/font-awesome.min.css" /><script src="https://use.typekit.net/lrm3jdv.js"></script><script>try{Typekit.load({ async: true });}catch(e){}</script></head><body style="background-color: #33AEDC;">',
				'<div class="modal-window">',
				'	<div class="modal-header"></div>',
				'	<div id="modal-close-button" class="modal-close"><i class="fa fa-close" style="line-height: 48px; height: 100%;"></i></div>',
				'	<div class="sm-modal-content">',
				'		<div id="sign-in-step" class="modal-step animate-250 active">',
				'			<h2 class="sm-modal-title animate-250">Uh oh!</h2>',
				'			<div class="sm-modal-error sm-full-width sm-text-l" style="text-align: center;">It looks like you already signed up with a '+err.type+' account: '+err.email+', not '+err.otherType+'</div><br><br><br><br><div class="sm-full-width sm-text-m" style="text-align: center;">Sign in with your '+err.type+' account below:</div>',
				((err.type==='google')?
				'			<a style="bottom: 10px;position: absolute;" href="https://'+config.subdomain+'.stuffmapper.com/api/v1/account/login/google" class="sign-in-up-input social-button google-plus-sign-in"><img src="/img/google-g-logo.svg" class="social-sign-in-icon social-sign-in-icon-google"><span class="social-sign-in-text sm-text-m">Sign in with Google</span></a>':
				'			<a style="bottom: 10px;position: absolute; color: #fff !important;" href="https://'+config.subdomain+'.stuffmapper.com/api/v1/account/login/facebook" class="sign-in-up-input social-button facebook-sign-in"><img src="/img/facebook-f-logo.svg" class="social-sign-in-icon social-sign-in-icon-facebook"><span class="social-sign-in-text sm-text-m">Sign in with Facebook</span></a>'),
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
		console.log(socket.handshake.session);
		if(data.to) {
			io.sockets.emit((''+data.to), {
				messages: {
					message: data.message,
					from: data.from,
					conversation: data.conversation
				}
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
