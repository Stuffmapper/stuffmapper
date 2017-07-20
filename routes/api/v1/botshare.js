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

var crawlerUserAgents = [
    'googlebot',
    'yahoo',
    'bingbot',
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
    'facebookexternalhit/1.1',
    'fb_iab/fb4a',
    'fban/fbios'
];

router.get('/', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'Stuffmapper',
                description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                image_url: 'https://cdn.stuffmapper.com/stuffmapper-logo.png',
                url: config.subdomain + '/stuff/get'
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

router.get('/stuff/get', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'Get Stuff - Stuffmapper',
                description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                image_url: 'https://cdn.stuffmapper.com/sharing-header.png',
                url: config.subdomain + '/stuff/get'
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

router.get('/stuff/get/:id', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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
                        title: 'Item not found - Stuffmapper',
                        description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                        image_url: 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
                        url: config.subdomain+'/stuff/get/'+result.rows[0].id
                    });
                }
                res.render('bot/fb-share', {
                    title: result.rows[0].title.trim()+' - Stuffmapper',
                    description: result.rows[0].description.trim() || 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                    image_url: 'https://cdn.stuffmapper.com'+ result.rows[0].image_url,
                    url: config.subdomain+'/stuff/get/'+result.rows[0].id
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

router.get('/stuff/give', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'Give Stuff - Stuffmapper',
                description: 'Get ready to give stuff!',
                image_url: 'https://cdn.stuffmapper.com/sharing-header.png',
                url: config.subdomain + '/stuff/give'
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

router.get('/stuff/my/items', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'My Stuff - Stuffmapper',
                description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                image_url: 'https://cdn.stuffmapper.com/sharing-header.png',
                url: config.subdomain + '/stuff/my/items'
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

router.get('/stuff/my/items/:id', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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
                        title: 'Item not found - Stuffmapper',
                        description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                        image_url: 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
                        url: config.subdomain+'/stuff/get/'
                    });
                }
                res.render('bot/fb-share', {
                    title: result.rows[0].title.trim()+' - Stuffmapper',
                    description: result.rows[0].description.trim() || 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
                    image_url: 'https://cdn.stuffmapper.com'+ result.rows[0].image_url,
                    url: config.subdomain+'/stuff/get/'+result.rows[0].id
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

router.get('/about', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'About - Stuffmapper',
                description: 'Our mission is to save millions of items from landfills everywhere and our vision is to support and grow the free reusable stuff movement.',
                image_url: 'https://cdn.stuffmapper.com/stuffmapper-logo.png',
                url: config.subdomain + '/about'
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

router.get('/privacy', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'Privacy Policy - Stuffmapper',
                description: 'Stuffmapper SPC ("Stuffmapper") is committed to creating and maintaining a trusted community, and takes precautions to prevent unauthorized access to or misuse of data about you. Stuffmapper does not share personally identifiable user data with third parties.',
                image_url: 'https://cdn.stuffmapper.com/stuffmapper-logo.png',
                url: config.subdomain + '/privacy'
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

router.get('/faq', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'FAQ - Stuffmapper',
                description: 'Our goal is to save millions of items from landfills everywhere and to support and grow the free reusable stuff movement by connecting people who want to give and get free reusable items.',
                image_url: 'https://cdn.stuffmapper.com/stuffmapper-logo.png',
                url: config.subdomain + '/faq'
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

router.get('/useragreement', function(req, res, next) {

    var userAgent = req.headers['user-agent'];
    var bufferAgent = req.headers['x-bufferbot'];
    var isCrawler = false;

    if (!!userAgent && req.method == 'GET') {
        //if it contains _escaped_fragment_, show prerendered page
        var query = url.parse(req.url, true).query;
        if (query && query['_escaped_fragment_'] !== undefined) {
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

        if (isCrawler) {
            res.render('bot/fb-share', {
                title: 'Terms of Service - Stuffmapper',
                description: 'Our goal is to save millions of items from landfills everywhere and to support and grow the free reusable stuff movement by connecting people who want to give and get free reusable items.',
                image_url: 'https://cdn.stuffmapper.com/stuffmapper-logo.png',
                url: config.subdomain + '/useragreement'
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
    console.log('BOT '+err);
    res.render('bot/fb-share', {
        title: 'Stuffmapper',
        description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
        image_url: 'https://cdn.stuffmapper.com/stuffmapper-logo.png',
        url: config.subdomain + '/stuff/get'
    });
}

module.exports = router;
