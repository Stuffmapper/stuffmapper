var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var upload = require('multer')({ dest: 'uploads/' });

var authenticator = function(res,req,next){
    if(req.session.userData && req.session.userData.loggedIn) next();
    else {
        res.send({
            err : {
                message : 'Permission Denied.  Please log in and try again',
                redirect : true
            }
        });
    }
};
//var authenticator = require('stuff_authenticator');

/* STUFF MANAGEMENT - START */

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

router.get('/stuff/:userId/:id', function(req, res) {
    req.db.get('stuff', {}, { userId : req.params.userId, id: req.params.id }, function(err, result) {
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
        res.json({
            err: {
                mesage : 'Error',
                redirect : true
            }
        });
    }
});

router.put('/stuff/:id', authenticator, function(req, res) {
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

router.delete('/stuff/:id', authenticator, function(req, res) {
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

router.post('/account/register', function(req, res) {
    var client = new pg.Client(conString);
    var body = req.body;
    // validate body inputs
    bcrypt.hashPassword(body.password, function(err, hashedPassword) {
        client.connect(function(err) {
            if(err) {
                console.log(err);
                client.end();
            }
            var query = [
                'INSERT INTO users (',
                'fname, lname, uname, email, password, phone_number, status, veryify_email_url',
                ') VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                'RETURNING *'
            ].join('');
            var values = [
                body.fname,
                body.lname,
                body.uname,
                body.email,
                hashedPassword,
                body.phone_number || null,
                'active',
                'supersecretemailthing'
            ];
            client.query(query, values, function(err, result) {
                if(err) {
                    console.log(err);
                    res.send({
                        err : {
                            message : err,
                            redirect : false
                        }
                    });
                    client.end();
                } else {
                    console.log(result);
                    res.send({
                        err : null,
                        res : {
                            fname : 'You did it!',
                            lname : 'Yaaaaay!',
                            uname : 'Woohoo!'
                        }
                    });
                }
            });
        });
    });
});

router.get('/account/login', function(req, res) {
    if(req.session.userData && req.session.userData.loggedIn) {
        res.send({
            err : {
                message : 'A user is already logged in.'
            }
        });
    }
    req.session.userData = {
        loggedIn : true,
        fname : 'ryan',
        lname : 'farmer',
        uname : 'ryanthefarmer'
    };
});

router.get('/account/logout', function(req, res) {
    if(req.session.userData && req.session.userData.loggedIn) {
        var userName = req.session.userData.uname;
        req.session.userData = {};
        res.send({
            err : null,
            data : {
                message : 'User ' + userName + ' has been logged out.'
            }
        });
    } else {
        res.send({
            err : 'User not logged in, can\'t log out.'
        });
    }
});

/* USER ACCOUNT MANAGEMENT -  END  */


module.exports = router;
