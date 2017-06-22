var passport = require('passport');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var FacebookStrategy = require( 'passport-facebook' ).Strategy;
var LocalStrategy = require('passport-local').Strategy;
var pg = require('pg');
var User = require('./user.js');
var path = require('path');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../../config'))[stage];


var GOOGLE_CLIENT_ID = '11148716793-2tm73u6gq8v33085htt27fr0j2ufl1cd.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = 't7-XA3IXfFZs3q3_5h1hxQwv';
var GOOGLE_CLIENT_CALLBACK = config.subdomain+'/auth/google_oauth2/callback';
// var FACEBOOK_CLIENT_ID = '1497795170480964';
// var FACEBOOK_CLIENT_SECRET = '79eb3898f556146e5645f666cbb27f6b';

var FACEBOOK_CLIENT_ID = '455657511303315';
var FACEBOOK_CLIENT_SECRET = '323f3bea3a85163cf52f8e710fa00852';
var FACEBOOK_CLIENT_CALLBACK = config.subdomain+'/auth/facebook_oauth2/callback';

// var GOOGLE_CLIENT_ID = config.auth.googleAuth.clientID;
// var GOOGLE_CLIENT_SECRET = config.auth.googleAuth.clientSecret;
// var GOOGLE_CLIENT_CALLBACK = config.auth.googleAuth.callbackURL;
// var FACEBOOK_CLIENT_ID = config.auth.facebookAuth.clientID;
// var FACEBOOK_CLIENT_SECRET = config.auth.facebookAuth.clientSecret;
// var FACEBOOK_CLIENT_CALLBACK = config.auth.facebookAuth.callbackURL;


passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({email:username}, function (err, user) {
			if (err) return done(err);
			if (!user) return done(null, false);
			if (user && !user.verified_email) return done(null, false, { message: 'Please verify your email address' });
			User.validatePassword(password, user.password, function(err, res) {
				if(err || !res) return done(null, false, { message: 'Incorrect password.' });
				return done(null, user);
			});
		});
	}
));

passport.use(new GoogleStrategy({
	clientID:     GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL:  GOOGLE_CLIENT_CALLBACK,
	passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, done) {
	console.log(req.session);
	User.findOrCreateOne('google', profile, req, function (err, user) {
		// console.log(err, user);
		if (err) return done(err);
		if (!user) return done(null, false);
		return done(null, user);
	});
}));

passport.use(new FacebookStrategy({
	clientID:     FACEBOOK_CLIENT_ID,
	clientSecret: FACEBOOK_CLIENT_SECRET,
	callbackURL: FACEBOOK_CLIENT_CALLBACK, /*config.subdomain+'/auth/facebook_oauth2/callback'*/
	profileFields: ['id', 'displayName', 'photos', 'email'],
	passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, done) {
	console.log(req.session);
	User.findOrCreateOne('facebook', profile, req, function (err, user) {
		console.log(err, user);
		if (err) return done(err);
		if (!user) return done(null, false);
		return done(null, user);
	});
}));
