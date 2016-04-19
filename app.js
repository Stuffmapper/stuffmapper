var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');

var index = require('./routes/index');
var api_v1 = require('./routes/api/v1/index');

var app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

var sess = {
    secret: 'SuperSecretPassword1!',
    cookie: {}
};
if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}
app.use(session(sess));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'www', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/css', express.static(path.join(__dirname, 'www/css')));
app.use('/lib', express.static(path.join(__dirname, 'www/lib')));
app.use('/img', express.static(path.join(__dirname, 'www/img')));
app.use('/js', express.static(path.join(__dirname, 'www/js')));

app.use(function(req, res, next) {
    var tempDB = {
        users: [
            {fname:'Ryan',lname:'Farmer',uname:'ryanthefarmer',passwd:'SuperPassword1!',id:1},
            {fname:'someone',lname:'else',uname:'someoneelse',passwd:'SecretPassword1!',id:2}
        ],
        stuff: [
            {userId:1, id:1, status:'undibbed', title:'asdf1',lat: 47.608013, lng: -122.335167,img:'http://s3.amazonaws.com/stuffmapper-1/images/images/000/000/040/medium/data?1454702614',category:'Furniture & Crap'},
            {userId:1, id:2, status:'undibbed', title:'asdf2',lat: 47.508013, lng: -122.335167,img:'http://s3.amazonaws.com/stuffmapper-1/images/images/000/000/040/medium/data?1454702614',category:'Food'},
            {userId:2, id:3, status:'undibbed', title:'asdf3',lat: 47.408013, lng: -122.335167,img:'http://s3.amazonaws.com/stuffmapper-1/images/images/000/000/040/medium/data?1454702614',category:'Electronics'}
        ]
    };
    req.db = {
        update : function(table, data, where, done) {
            var result = 'data updated successfully';
            var err = null;
            done(err, result);
        },
        insert : function(table, data, done) {
            tempDB[table].push(data);
            var result = 'data added successfully';
            var err = null;
            done(err, result);
        },
        get : function(table, columns, where, done) {
            columns = columns || {};
            where = where || {};
            done = done || {};
            if(typeof where === "function") done = where;
            if(typeof columns === "function") done = columns;
            var result = [];
            var add = false;
            var keys = '';
            tempDB[table].forEach(function(e) {
                add = true;
                keys = Object.keys(where);
                if(keys.length > 0) {
                    keys.forEach(function(f) {
                        if(parseInt(e[f]) !== parseInt(where[f])) add = false;
                    });
                }
                else add = true;
                if(add) result.push(e);
            });
            var err = null;
            done(err, result);
        }
    };
    next();
});

app.use('/api/v1', api_v1);

['', '-getstuff', '-getstuff-id', '-givestuff', '-mystuff'].forEach(function(e) {
    var page = 'partials/home/partial-home'+e;
    app.get('/' + page, function(req, res, next) {
        res.render(page, {'doctype': 'html'});
    });
});

app.get('/partials/about/', function(req, res, next) {
    res.render(page, {'doctype': 'html'});
});

app.use('*', index);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
