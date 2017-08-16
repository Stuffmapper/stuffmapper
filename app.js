var AWS = require('aws-sdk');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var emoji = require('node-emoji');
var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient();
// var apicache = require('apicache');
// let cacheWithRedis = apicache.options({ redisClient: client }).middleware;
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
var _ = require('lodash');
var gzipStatic = require('connect-gzip-static');
var debug = require('debug')('stuffmapper:app.js');
var sms = require('./routes/api/v1/config/sms');
var pg = require('pg');
var pgUser = config.db.user;
var pgDb = config.db.db;
var pgPass = config.db.pass;
var pgHost = config.db.host;
var pgPort = config.db.port;
var pgconfig = {
    user: pgUser,
    database: pgDb,
    password: pgPass,
    host: pgHost,
    port: 5432,
    max: 12,
    idleTimeoutMillis: 1000
};
var pool = new pg.Pool(pgconfig);
var conString = 'postgres://' + pgUser + ':' + pgPass + '@' + pgHost + ':' + pgPort + '/' + pgDb;
AWS.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
});
var s3 = new AWS.S3({ Bucket: config.aws.bucket });
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
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
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
app.use('/', gzipStatic(path.join(__dirname, 'favicons')));
app.use('/', gzipStatic(path.join(__dirname, 'web')));
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
    console.log('nonce', nonceFromTheClient);
    if (!nonceFromTheClient) return res.send('failure');
    gateway.transaction.sale({
        amount: '1.00',
        paymentMethodNonce: nonceFromTheClient,
        options: {
            verifyCard: true
        },
        deviceData: req.body.device_data
    }, function(err, result) {
        console.log(err, result);
        if (err) return res.send('failure');
        res.send('success');
    });
});

app.get('/redirect', function(req, res) { res.render('redirect'); });

app.get('/auth/google_oauth2/callback', function(req, res, next) {
    passport.authenticate('google', function(err, user, info) {
        if (err && err.message === 'account exists') {
            return res.send([
                '<html><head><title>Sign In</title><link rel="stylesheet" href="/js/lib/normalize-css/normalize.css" /><link rel="stylesheet" href="/js/lib/animate.css/animate.min.css" /><link rel="stylesheet" href="/css/main.css" /><link rel="stylesheet" href="/css/main.app.min.css" /><link rel="stylesheet" href="/js/lib/bootstrap/dist/css/bootstrap.min.css" /><link rel="stylesheet" href="/css/font-awesome.min.css" /><script src="https://use.typekit.net/lrm3jdv.js"></script><script>try{Typekit.load({ async: true });}catch(e){}</script></head><body style="background-color: #33AEDC;">',
                '<div class="modal-window">',
                '	<div class="modal-header"></div>',
                '	<div id="modal-close-button" class="modal-close"><i class="fa fa-close" style="line-height: 48px; height: 100%;"></i></div>',
                '	<div class="sm-modal-content">',
                '		<div id="sign-in-step" class="modal-step animate-250 active">',
                '			<h2 class="sm-modal-title animate-250">Uh oh!</h2>',
                '			<div class="sm-modal-error sm-full-width sm-text-l" style="text-align: center;">It looks like you already signed up with a ' + capitalizeFirstLetter(err.type) + ' account: ' + err.email + ', not ' + capitalizeFirstLetter(err.otherType) + '</div><br><br><br><br><div class="sm-full-width sm-text-m" style="text-align: center;">Sign in with your ' + capitalizeFirstLetter(err.type) + ' account below:</div>',
                ((err.type === 'google') ?
                    '			<a style="bottom: 10px;position: absolute;" href="' + config.subdomain + '/api/v1/account/login/google" class="sign-in-up-input social-button google-plus-sign-in"><img src="/img/google-g-logo.svg" class="social-sign-in-icon social-sign-in-icon-google"><span class="social-sign-in-text sm-text-m">Sign in with Google</span></a>' :
                    '			<a style="bottom: 10px;position: absolute; color: #fff !important;" href="' + config.subdomain + '/api/v1/account/login/facebook" class="sign-in-up-input social-button facebook-sign-in"><img src="/img/facebook-f-logo.svg" class="social-sign-in-icon social-sign-in-icon-facebook"><span class="social-sign-in-text sm-text-m">Sign in with Facebook</span></a>'),
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
    })(req, res, next);
});

app.get('/auth/facebook_oauth2/callback', function(req, res, next) {
    passport.authenticate('facebook', { scope: ['id', 'displayName', 'public_profile', 'email'] }, function(err, user, info) {
        if (err && err.message === 'account exists') {
            return res.send([
                '<html><head><title>Sign In</title><link rel="stylesheet" href="/js/lib/normalize-css/normalize.css" /><link rel="stylesheet" href="/js/lib/animate.css/animate.min.css" /><link rel="stylesheet" href="/css/main.css" /><link rel="stylesheet" href="/css/main.app.min.css" /><link rel="stylesheet" href="/js/lib/bootstrap/dist/css/bootstrap.min.css" /><link rel="stylesheet" href="/css/font-awesome.min.css" /><script src="https://use.typekit.net/lrm3jdv.js"></script><script>try{Typekit.load({ async: true });}catch(e){}</script></head><body style="background-color: #33AEDC;">',
                '<div class="modal-window">',
                '	<div class="modal-header"></div>',
                '	<div id="modal-close-button" class="modal-close"><i class="fa fa-close" style="line-height: 48px; height: 100%;"></i></div>',
                '	<div class="sm-modal-content">',
                '		<div id="sign-in-step" class="modal-step animate-250 active">',
                '			<h2 class="sm-modal-title animate-250">Uh oh!</h2>',
                '			<div class="sm-modal-error sm-full-width sm-text-l" style="text-align: center;">It looks like you already signed up with a ' + err.type + ' account: ' + err.email + ', not ' + err.otherType + '</div><br><br><br><br><div class="sm-full-width sm-text-m" style="text-align: center;">Sign in with your ' + err.type + ' account below:</div>',
                ((err.type === 'google') ?
                    '			<a style="bottom: 10px;position: absolute;" href="' + config.subdomain + '/api/v1/account/login/google" class="sign-in-up-input social-button google-plus-sign-in"><img src="/img/google-g-logo.svg" class="social-sign-in-icon social-sign-in-icon-google"><span class="social-sign-in-text sm-text-m">Sign in with Google</span></a>' :
                    '			<a style="bottom: 10px;position: absolute; color: #fff !important;" href="' + config.subdomain + '/api/v1/account/login/facebook" class="sign-in-up-input social-button facebook-sign-in"><img src="/img/facebook-f-logo.svg" class="social-sign-in-icon social-sign-in-icon-facebook"><span class="social-sign-in-text sm-text-m">Sign in with Facebook</span></a>'),
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
    })(req, res, next);
});

io.on('connection', function(socket) {
    socket.on('message', function(data) {
        if (data.to) {
            queryServer('SELECT count(messages) FROM messages, conversations WHERE (conversations.lister_id = $1 OR conversations.dibber_id = $1) AND NOT messages.user_id = $1 AND messages.conversation_id = conversations.id AND conversations.archived = false AND messages.archived = false AND messages.read = false', [data.to], function(result) {
                io.sockets.emit((data.to), {
                    messages: {
                        message: data.message,
                        from: data.from,
                        conversation: data.conversation,
                        unread: result.rows[0].count,
                        title: data.title
                    }
                });
            });
        }
    });
});
io.on('disconnect', function(socket) {
    console.log('a user disconnected');
});
app.use('/', require('./routes/api/v1/botshare'));
app.use('/api/v1', require('./routes/api/v1/index'));
// app.use('/api/v1',cacheWithRedis('5 minutes'), require('./routes/api/v1/index'));

// catch 404 and forward to error handler /* can't enable it due to html5 routing on frontend*/
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     return res.status(404).json({error: true, message: err.message });
// });

// error handler
app.use(function (err, req, res, next) {
    if(!err) return next();
    return res.status(err.statusCode || 500).json({error: true, message: [err.message] || [] });
});

app.use('/*', function(req, res) {
    res.render('index', {
        loggedIn: req.isAuthenticated(),
        isDev: true,
        config: config
    });
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

http.listen(port, function() {
    console.log('Listening on port ' + port + "in " + stage + " environment");
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
        if (err) return client.end();
        client.query(query, values, function(err, result) {
            if (err) return client.end();
            client.end();
            cb(result);
        });
    });
}


var jobs = 1;
var completeJobs = 0;

setInterval(function() {

    queryServer('SELECT * FROM conversations WHERE archived = false', [], function(result1) {
        if (result1.rows.length === 0) {
            console.log("No active conversation found");
            return;
        }
        var conversations = result1.rows.length;
        var conversation_counter = 0;

        var conversationIds = [];
        result1.rows.forEach(function(e, i) {
            console.log("conv_id:post_id:lister_id:dibber_id " + e.id, e.post_id, e.lister_id, e.dibber_id);
            conversationIds.push(e.id);
        });


        queryServer('SELECT * FROM messages WHERE conversation_id = ANY($1::int[]) AND archived = false', [conversationIds], function(result2) {
            if (result2.rows.length === 0) {
                console.log("No active messages found related to conversation");
                return;
            }
            var conversation = [];
            var groupByConversationId = _.groupBy(result2.rows, "conversation_id");
            _.forEach(groupByConversationId, function(singleConvArr, conversation_id) {
                var message = _.orderBy(singleConvArr, ['date_created'], ['desc'])[0];
                conversation.push(message);
            });

            result1.rows.forEach(function(e, i) {
                var lastMessage = _.find(conversation, { 'conversation_id': parseInt(e.id) });
                var convTime = new Date(e.date_created).getTime();
                var messTime = lastMessage ? new Date(lastMessage.date_created).getTime() : 0;
                var currTime = new Date().getTime();
                var convAgeMin = new Date(currTime - convTime).getUTCMinutes();
                var messAgeMin = new Date(currTime - messTime).getUTCMinutes();
                if (lastMessage) {
                    var dibberMessaged = false;
                    _.forEach(groupByConversationId[parseInt(e.id)], function(singleConvRecord) {
                        if (e.dibber_id === singleConvRecord.user_id) {
                            dibberMessaged = true;
                        }
                    });
                    if (!dibberMessaged && convAgeMin >= 15) {
                        undib(e.post_id, e.dibber_id);
                    } else if (!lastMessage.emailed && messAgeMin === 3) messageUserMessageNotification(((lastMessage.user_id === e.lister_id) ? e.dibber_id : e.lister_id), e.id, e.post_id);
                    else if (messAgeMin === 24 * 60) messageUserMessageReminder(((lastMessage.user_id === e.lister_id) ? e.dibber_id : e.lister_id), e.id, e.post_id);
                } else {
                    if (convAgeMin >= 15) {
                        undib(e.post_id, e.dibber_id);
                    }
                }
                if (++conversation_counter === conversations) {
                    jobsDone();
                }
            });
        });
    });

}, 1000 * 60 * 1); // ms * sec * min

var post_reminder_jobs = 1;
var post_reminder_completeJobs = 0;

setInterval(function() {

    queryServer(['SELECT p.id, p.title, p.user_id as lister_id, p.dibber_id ',
        'FROM posts p INNER JOIN pick_up_success ps ON p.id = ps.post_id ',
        'AND ps.undibbed = false AND ps.pick_up_init < (current_date - interval \'5\' day) ',
        'AND p.dibbed = true AND p.archived = false AND ps.pick_up_sms = false'
    ].join(' '), [], function(result1) {
        if (result1.rows.length === 0) {
            console.error('No Data for pick up sms ' + new Date());
            return;
        }
        console.error('Data for pick up sms ' + new Date(), _.size(result1.rows))
        var total_post = result1.rows.length;
        var post_counter = 0;
        // var pgconfig = {
        // 	user: pgUser,
        // 	database: pgDb,
        // 	password: pgPass,
        // 	host: pgHost,
        // 	port: 5432,
        // 	max: 10,
        // 	idleTimeoutMillis: 1000
        // };
        // var pool = new pg.Pool(pgconfig);
        pool.connect(function(err, client, done) {
            if (err) {
                console.error('error fetching client from pool', err);
                return;
            }
            result1.rows.forEach(function(post) {
                client.query('UPDATE pick_up_success set pick_up_sms = true, pick_up_sms_init = current_timestamp where pick_up_success = false AND undibbed = false AND post_id = $1 AND dibber_id = $2 AND lister_id = $3 RETURNING *', [post.id, post.dibber_id, post.lister_id], function(err, result0) {
                    if (err) {
                        done(err);
                        console.error('error running query2', err);
                        return;
                    }
                    if (!result0.rows && !result0.rows.length) {
                        done();
                        console.error('No Data for update pick_up_sms ' + new Date());
                        return;
                    }
                    console.log("Updated Pick UP post_id:lister_id:dibber_id: " + post.id, post.lister_id, post.dibber_id);
                    client.query('SELECT phone_number FROM users WHERE (id = $1 OR id = $2)', [post.lister_id, post.dibber_id], function(err, result2) {
                        result2.rows.forEach(function(e) {
                            console.log('sms to: ' + post.id + " - " + e.phone_number);
                            var sms_message = 'Stuffmapper asks, has ' + post.title.trim() + ' been picked up? If not yet, no reply is necessary. If yes, please mark item as picked up by responding with "' + post.id + '".';
                            var phone_number = e.phone_number;
                            sms.sendSMS(phone_number, sms_message);
                        });
                    });
                });
                if (++post_counter === total_post) {
                    findingPostsMarkUpDone(done);
                    done();
                }
            });

            pool.on('error', function(err, client) {
                console.error('idle client error', err.message, err.stack);
            });

        });
    });
}, 1000 * 60 * 60 * 1); // ms * sec * min * hour

function undib(post_id, user_id) {
    console.log("undib: post_id=" + post_id + " user_id=" + user_id);
    // var pgconfig = {
    // 	user: pgUser,
    // 	database: pgDb,
    // 	password: pgPass,
    // 	host: pgHost,
    // 	port: 5432,
    // 	max: 10,
    // 	idleTimeoutMillis: 1000
    // };
    // var pool = new pg.Pool(pgconfig);
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
            if (err || result1.rows.length === 0) return done();
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
                if (err) return done();
                var query = [
                    'UPDATE conversations SET archived = true, date_edited = current_timestamp',
                    'WHERE post_id = $1 RETURNING *'
                ].join(' ');
                client.query(query, [post_id], function(err, result3) {
                    if (err) return done();
                    var query = 'SELECT uname, email, phone_number, dibs_expire_notify FROM users WHERE id = $1';
                    var values = [user_id];
                    client.query(query, values, function(err, result4) {
                        if (err) return done();
                        query = 'SELECT image_url FROM images WHERE post_id = $1 AND main = true';
                        client.query(query, [post_id], function(err, result5) {
                            if (err) return done();
                            io.sockets.emit(('' + user_id), {
                                undibsd: post_id
                            });
                            db.setEvent(3, 'Dibs for {{post}} cancelled; you did not send a message.', user_id, post_id);
                            sendTemplate(
                                'dibs-expired',
                                'Your Dibs has expired', {
                                    [result4.rows[0].uname]: result4.rows[0].email }, {
                                    'FIRSTNAME': result4.rows[0].uname,
                                    'ITEMTITLE': result1.rows[0].title,
                                    'ITEMNAME': result1.rows[0].title,
                                    'ITEMIMAGE': 'https://cdn.stuffmapper.com' + result5.rows[0].image_url,
                                    'GETSTUFFLINK': config.subdomain + '/stuff/get'
                                },
                                result4.rows[0].dibs_expire_notify
                            );
                            var sms_message = "Dibs expired for " + result1.rows[0].title.trim() + ". You didn't message the lister within 15 minutes of Dibsing it. " + emoji.get(':snail:');
                            var phone_number = result4.rows[0].phone_number;
                            sms.sendSMS(phone_number, sms_message, result4.rows[0].dibs_expire_notify);

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
    console.log("messageUserMessageNotification: post_id=" + post_id + " user_id=" + user_id + " conversation_id=" + conversation_id);
    queryServer('SELECT * FROM messages WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false ORDER BY date_created ASC', [user_id, conversation_id], function(result1) {
        queryServer('SELECT uname, email, phone_number FROM users WHERE id = $1', [user_id], function(result2) {
            queryServer('UPDATE messages SET emailed = true WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false', [user_id, conversation_id], function(result10) {
                queryServer('SELECT title, id, dibber_id, user_id FROM posts WHERE id = $1 AND dibbed =true and archived = false', [post_id], function(result3) {
                    if (!result3.rows.length) {
                        return;
                    }
                    queryServer('SELECT image_url FROM images WHERE post_id = $1 AND main = true', [post_id], function(result5) {
                        queryServer('SELECT uname, phone_number FROM users WHERE (id = $1 OR id = $2) AND NOT id = $3', [result3.rows[0].user_id, result3.rows[0].dibber_id, user_id], function(result6) {
                            var test = [];
                            result1.rows.forEach(function(e) { test.push(e.message); });
                            if (test.join('') && test.join('').trim()) {
                                sendTemplate(
                                    'message-notification',
                                    'You received a message!', {
                                        [result2.rows[0].uname]: result2.rows[0].email }, {
                                        'FIRSTNAME': result2.rows[0].uname,
                                        'USERNAME': result6.rows[0].uname,
                                        'ITEMTITLE': result3.rows[0].title,
                                        'ITEMNAME': result3.rows[0].title,
                                        'CHATLINK': config.subdomain + '/stuff/my/items/' + post_id + '/messages',
                                        'ITEMIMAGE': 'https://cdn.stuffmapper.com' + result5.rows[0].image_url,
                                        'MESSAGE': test.join('<br>').trim()
                                    }
                                );
                                var emoji_message = emoji.get(':trumpet:') + "" + emoji.get(':musical_note:') + "" + emoji.get(':trumpet:');
                                var sms_message = emoji_message + "\nMessage from " + result6.rows[0].uname + " about " + result3.rows[0].title.trim() + ": " + test.join('\n').trim() + "\n" + config.subdomain + '/stuff/my/items/' + post_id + '/messages';
                                var phone_number = result2.rows[0].phone_number;
                                sms.sendSMS(phone_number, sms_message);
                            }
                        });
                    });
                });
            });
        });
    });
}

function messageUserMessageReminder(user_id, conversation_id, post_id) {
    console.log("messageUserMessageReminder: post_id=" + post_id + " user_id=" + user_id + " conversation_id=" + conversation_id);
    queryServer('SELECT * FROM messages WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false ORDER BY date_created ASC', [user_id, conversation_id], function(result1) {
        queryServer('SELECT uname, email, phone_number FROM users WHERE id = $1', [user_id], function(result2) {
            queryServer('UPDATE messages SET emailed = true WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false', [user_id, conversation_id], function(result10) {
                queryServer('SELECT title, id, dibber_id, user_id FROM posts WHERE id = $1 AND dibbed =true and archived = false', [post_id], function(result3) {
                    if (!result3.rows.length) {
                        return;
                    }
                    queryServer('SELECT image_url FROM images WHERE post_id = $1 AND main = true', [post_id], function(result5) {
                        queryServer('SELECT uname, phone_number FROM users WHERE (id = $1 OR id = $2) AND NOT id = $3', [result3.rows[0].user_id, result3.rows[0].dibber_id, user_id], function(result6) {
                            var test = [];
                            result1.rows.forEach(function(e) { test.push(e.message); });
                            if (test.join('') && test.join('').trim()) {
                                sendTemplate(
                                    'message-notification',
                                    // This should be message-reminder, but message-reminder was
                                    // never created.  The email template would ideally be the
                                    // same, but this is a bit quicker to implement.
                                    // ...it's like reusing code?
                                    'Reminder: You received a message!', {
                                        [result2.rows[0].uname]: result2.rows[0].email }, {
                                        'FIRSTNAME': result2.rows[0].uname,
                                        'USERNAME': result6.rows[0].uname,
                                        'ITEMTITLE': result3.rows[0].title,
                                        'ITEMNAME': result3.rows[0].title,
                                        'CHATLINK': config.subdomain + '/stuff/my/items/' + post_id + '/messages',
                                        'ITEMIMAGE': 'https://cdn.stuffmapper.com' + result5.rows[0].image_url,
                                        'MESSAGE': test.join('<br>').trim()
                                    }
                                );
                                var emoji_message = emoji.get(':trumpet:') + "" + emoji.get(':musical_note:') + "" + emoji.get(':trumpet:');
                                var sms_message = emoji_message + "\nReminder:\nMessage from " + result6.rows[0].uname + " about " + result3.rows[0].title.trim() + ": " + test.join('\n').trim() + "\n" + config.subdomain + '/stuff/my/items/' + post_id + '/messages';
                                var phone_number = result2.rows[0].phone_number;
                                sms.sendSMS(phone_number, sms_message);
                            }
                        });
                    });
                });
            });
        });
    });
}

function findingPostsMarkUpDone() {
    if (++post_reminder_completeJobs === post_reminder_jobs) {
        if (arguments) {
            for (var i = 0; i < Object.keys(arguments).length; i++) {
                if (typeof arguments[i] === 'function') process.nextTick(arguments[i]);
            }
        }
    }
}

function jobsDone() {
    if (++completeJobs === jobs) {
        if (arguments) {
            for (var i = 0; i < Object.keys(arguments).length; i++) {
                if (typeof arguments[i] === 'function') process.nextTick(arguments[i]);
            }
        }
    }
}

function emailPermission(code) {
    if (code == undefined || code == null) {
        return true;
    } else if (code == 2 || code == 3) {
        return true;
    } else {
        return false;
    }
}

function sendTemplate(template, subject, to, args, sendingCode) {
    if (emailPermission(sendingCode)) {
        var mandrill = require('mandrill-api/mandrill');
        var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
        var template_name = template;
        var template_content = [];
        Object.keys(args).forEach(function(e) {
            template_content.push({
                'name': e,
                'content': args[e]
            });
        });
        var emailTo = [];
        Object.keys(to).forEach(function(e) {
            if (!_.isEmpty(to[e])) {
                emailTo.push({
                    'email': to[e],
                    'name': e,
                    'type': 'to'
                });
            }
        });
        if (!emailTo.length) {
            console.log('Can\'t send email, No email is defined');
            return;
        }
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
        mandrill_client.messages.sendTemplate({
            'template_name': template_name,
            'template_content': template_content,
            'message': message,
            'async': false,
            'ip_pool': 'Main Pool'
        }, function(result) {
            console.log(result);
        }, function(e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        });
    }
}