var passport = require('passport');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var FacebookStrategy = require( 'passport-facebook' ).Strategy;
var LocalStrategy = require('passport-local').Strategy;
var pg = require('pg');
var User = require('./user.js');

var GOOGLE_CLIENT_ID = '11148716793-2tm73u6gq8v33085htt27fr0j2ufl1cd.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = 't7-XA3IXfFZs3q3_5h1hxQwv';
var FACEBOOK_CLIENT_ID = '1497795170480964';
var FACEBOOK_CLIENT_SECRET = '79eb3898f556146e5645f666cbb27f6b';

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({email:username}, function (err, user) {
			if (err) return done(err);
			if (!user) return done(null, false);
			User.validatePassword(password, user.password, function(err, res) {
				if(err || !res) return done(null, false);
				return done(null, user);
			});
		});
	}
));

passport.use(new GoogleStrategy({
	clientID:     GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL: 'http://localhost:3000/auth/google_oauth2/callback'
},
function(accessToken, refreshToken, profile, done) {
	User.findOrCreateOne('google', profile, function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false);
		User.validatePassword(password, user.password, function(err, res) {
			if(err || !res) return done(null, false);
			return done(null, user);
		});
	});
}));

passport.use(new FacebookStrategy({
	clientID:     FACEBOOK_CLIENT_ID,
	clientSecret: FACEBOOK_CLIENT_SECRET,
	callbackURL: 'http://localhost:3000/auth/callback'
},
function(accessToken, refreshToken, profile, done) {
	User.findOrCreateOne('facebook', profile, function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false);
		User.validatePassword(password, user.password, function(err, res) {
			if(err || !res) return done(null, false);
			return done(null, user);
		});
	});
}));