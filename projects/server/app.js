var express = require('express');
var port = process.env.PORT || 3000;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');

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

app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '../web')));

app.use(function(req, res, next) {
    var tempDB = {
        users: [
            {fname:'Ryan',lname:'Farmer',uname:'ryanthefarmer',passwd:'SuperPassword1!',id:1},
            {fname:'someone',lname:'else',uname:'someoneelse',passwd:'SecretPassword1!',id:2}
        ],
        stuff: [
            {userId:1, id:1, status:'undibbed', title:'asdf1',lat: 47.608013, lng: -122.335167,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Adirondack2.jpg/220px-Adirondack2.jpg',orientation:'portait',category:'Furniture & Crap'},
            {userId:1, id:2, status:'undibbed', title:'asdf2',lat: 47.508013, lng: -122.335167,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Adirondack2.jpg/220px-Adirondack2.jpg',orientation:'landscape',category:'Food'},
            {userId:2, id:3, status:'undibbed', title:'asdf3',lat: 47.408013, lng: -122.335167,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Adirondack2.jpg/220px-Adirondack2.jpg',orientation:'portait',category:'Electronics'},
            {userId:2, id:4, status:'undibbed', title:'asdf4',lat: 47.308013, lng: -122.335167,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Adirondack2.jpg/220px-Adirondack2.jpg',orientation:'portait',category:'For BABIES'},
            {userId:1, id:5, status:'undibbed', title:'asdf5',lat: 47.208013, lng: -122.335167,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Adirondack2.jpg/220px-Adirondack2.jpg',orientation:'landscape',category:'Decoration'},
            {userId:2, id:6, status:'undibbed', title:'asdf6',lat: 47.108013, lng: -122.335167,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Adirondack2.jpg/220px-Adirondack2.jpg',orientation:'landscape',category:'Auto'}
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

app.use('/api/v1', require('./routes/api/v1/index'));
app.use('*', function(req,res){res.render('index');});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var server = app.listen(port);
console.log('Listening on port ' + port);
process.on('SIGTERM', function() {
    server.close(function() {
        console.log('Closed all connections');
        process.exit();
    });
    setTimeout(function() {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 5000);
});
process.on('SIGINT', function() {
    console.log('\nAttempting to close all connections...');
    server.close(function() {
        console.log('Closed all connections');
        process.exit();
    });
    setTimeout(function() {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 5000);
});
