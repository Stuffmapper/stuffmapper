var express = require('express');
var router = express.Router();
var pg = require('pg');

//var authenticator = function(res,req,next){next();};//require('authenticator');

router.get('/stuff', function(req, res) {
    req.db.get('stuff', function(err, result) {
        res.json(result);
    });
});

router.get('/stuff/:id', function(req, res) {
    req.db.get('stuff', {}, { id : req.params.id }, function(err, result) {
        res.json(result);
    });
});

router.post('/stuff', function(req, res) {
    var stuff = [];
    if(req.params.id <= db.users.length) {
        var uname = db.users[req.params.id-1].uname;
        res.json(db.stuff[uname]);
    }
    else {
        res.json({err:'Error'});
    }
});

router.put('/stuff/:id', function(req, res) {
    var stuff = [];
    if(req.params.id <= db.users.length) {
        var uname = db.users[req.params.id-1].uname;
        res.json(db.stuff[uname]);
    }
    else {
        res.json({err:'Error'});
    }
});

router.delete('/stuff/:id', function(req, res) {
    var stuff = [];
    if(req.params.id <= db.users.length) {
        var uname = db.users[req.params.id-1].uname;
        res.json(db.stuff[uname]);
    }
    else {
        res.json({err:'Error'});
    }
});

module.exports = router;
