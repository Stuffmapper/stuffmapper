var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var index = require('./routes/index');
var api_v1 = require('./routes/api/v1/index');

var app = express();

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

app.use('/api/v1', api_v1);

['','get','give','my'].forEach(function(e) {
    var page = 'partials/home/partial-home'+(e?'-'+e+'stuff':'');
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
