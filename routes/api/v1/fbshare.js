/**
 * Created by Arsalan on 19/7/2017.
 */

var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../config'))[stage];
var pgUser = config.db.user;
var pgDb = config.db.db;
var pgPass = config.db.pass;
var pgHost = config.db.host;
var pgPort = config.db.port;
var conString = 'postgres://'+pgUser+':'+pgPass+'@'+pgHost+':'+pgPort+'/'+pgDb;
var debug = require('debug')('stuffmapper:fbshare-route');
var url = require('url');
var jade = require('jade');

router.get('/stuff/get/:id', function(req, res, next) {

    var crawlerUserAgents = [
//        'googlebot',
//        'yahoo',
//        'bingbot',
        'baiduspider',
        'facebookexternalhit',
        'twitterbot',
        'rogerbot',
        'linkedinbot',
        'facebot',
        'embedly',
        'quora link preview',
        'showyoubot',
        'outbrain',
        'pinterest',
        'twitterbot',
        'facebookexternalhit/1.0',
        'facebookexternalhit/1.1'
    ];

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        if (url.parse(req.url, true).query.hasOwnProperty('_escaped_fragment_')) {
            isCrawler = true;
        }

        //if it is a bot...show prerendered page
        if (crawlerUserAgents.some(function (crawlerUserAgent) {
                return userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1;
            })) {
            isCrawler = true;
        }

        //if it is BufferBot...show prerendered page
        if (bufferAgent) {
            isCrawler = true;
        }

        if (isCrawler)
        {
            var query = [
                'SELECT posts.id, posts.title, posts.description, posts.attended,',
                'posts.lat, posts.lng, categories.category, images.image_url,',
                'posts.date_created, posts.date_edited, posts.dibbed, posts.dibber_id',
                'FROM posts, images, categories',
                'WHERE images.post_id = posts.id AND posts.id = $1 AND',
                'categories.id = posts.category_id AND images.main = true AND posts.archived = false'
            ].join(' ');
            queryServer(res, query, [req.params.id], function (result) {
                if (!result.rows.length) {
                    return res.render('fb-share', {
                        title: 'Item not found',
                        description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                        image_url: 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
                        url: 'https://www.stuffmapper.com/stuff/get/'
                    });
                }
                res.render('fb-share', {
                    title: result.rows[0].title.trim(),
                    description: result.rows[0].description || 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                    image_url: 'https://cdn.stuffmapper.com'+ result.rows[0].image_url,
                    url: 'https://www.stuffmapper.com/stuff/get/'+result.rows[0].id
                });
            });
        }
        else{
            next();
        }
    }
    else {
        next();
    }
});

function queryServer(res, query, values, cb) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            apiError(res, err);
            return client.end();
        }
        client.query(query, values, function(err, result) {
            if(err) {
                apiError(res, err);
                return client.end();
            }
            client.end();
            cb(result);
        });
    });
}

function apiError(res, err) {
    console.log(err);
    res.send({
        err : {
            message : err,
            redirect : false
        }
    });
}

module.exports = router;
