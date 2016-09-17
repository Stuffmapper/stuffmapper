var AWS = require('aws-sdk');
var express = require('express');
var port = process.env.PORT || 3000;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var passport = require('passport');
var User = require('./routes/api/v1/config/user');
var stage = process.env.STAGE || 'development';
var config = require('../../config')[stage];
var multer = require('multer');
var multerS3 = require('multer-s3');
var braintree = require('braintree');
var proxy = require('express-http-proxy');
var pg = require('pg');
var conString = 'postgres://stuffmapper:SuperSecretPassword1!@localhost:5432/stuffmapper';
AWS.config = new AWS.Config();
AWS.config.accessKeyId = 'AKIAJQZ2JZJQHGJV7UBQ';
AWS.config.secretAccessKey = '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';
var s3 = new AWS.S3({Bucket:'stuffmapper-v2',region:'us-west-2'});
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use('/styleguide', proxy('http://localhost:3002/'));
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
app.use(session({
	cookie: {
		maxAge: 36000000
	},
	secret: 'SuperSecretPassword1!',
	saveUninitialized: true,
	resave: true
}));
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '../web')));

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
			submitForSettlement: true
		}
	}, function (err, result) {
		if(err) return res.send('failure');
		res.send('success');
	});
});

app.post('/checkout/earlydibs', function(req, res) {
	var nonceFromTheClient = req.body.payment_method_nonce;
	if(!nonceFromTheClient) return res.send('failure');
	gateway.transaction.sale({
		amount: '5.00',
		paymentMethodNonce: nonceFromTheClient,
		options: {
			submitForSettlement: true
		}
	}, function (err, result) {
		if(err) return res.send('failure');
		res.send('success');
	});
});

app.get('/redirect',function(req,res){res.render('redirect');});

app.get('/auth/google_oauth2/callback', passport.authenticate('google', {
	successRedirect: '/redirect',
	failureRedirect: '/api/v1/account/login/google'
}));

app.get('/auth/facebook_oauth2/callback', passport.authenticate('facebook', {
	successRedirect: '/redirect',
	failureRedirect: '/api/v1/account/login/facebook'
}));

io.on('connection', function(socket){
	socket.on('message', function(data) {
		if(data.to) {
			io.sockets.emit((''+data.to), {
				messages: {
					message: data.message,
					from: data.from,
					conversation: data.conversation
				}
			});
		}
		// 	socket.emit('test', {data:'pants'});
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
