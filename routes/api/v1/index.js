var express = require('express');
var router = express.Router();
var pg = require('pg');

//var authenticator = function(res,req,next){next();};//require('authenticator');

var db = {
    users: [
        {fname:'Ryan',lname:'Farmer',uname:'ryanthefarmer',pword:'SuperPassword1!',id:1},
        {fname:'someone',lname:'else',uname:'someoneelse',pword:'SecretPassword1!',id:2}
    ],
    stuff: {
        'ryanthefarmer':[
            {new:true, title:'asdf1',position:{lat: 47.608013, lng: -122.335167},img:'http://s3.amazonaws.com/stuffmapper-1/images/images/000/000/040/medium/data?1454702614',category:'Furniture & Crap'},
            {new:false, title:'asdf2',position:{lat: 47.508013, lng: -122.335167},img:'http://s3.amazonaws.com/stuffmapper-1/images/images/000/000/040/medium/data?1454702614',category:'Food'}
        ],
        'someoneelse':[
            {new:false, title:'asdf3',position:{lat: 47.408013, lng: -122.335167},img:'http://s3.amazonaws.com/stuffmapper-1/images/images/000/000/040/medium/data?1454702614',category:'Electronics'}
        ]
    }
};

router.get('/stuff', function(req, res) {
    var stuff = [];
    Object.keys(db.stuff).forEach(function(e) {
        db.stuff[e].forEach(function(f) {
            stuff.push(f);
        });
    });
    res.json(stuff);
});

router.get('/stuff/:id', function(req, res) {
    var stuff = [];
    if(req.params.id <= db.users.length) {
        var uname = db.users[req.params.id-1].uname;
        res.json(db.stuff[uname]);
    }
    else {
        res.json({err:'Error'});
    }
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
