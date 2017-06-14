/**
 * Created by Arsalan on 29/5/2017.
 */

var path = require('path');
var stage = process.env.STAGE || 'development';
var config = require(path.join(__dirname, '/../../../../config'))[stage];
var _ = require('lodash');
var twilio = require('twilio');
var accountSid = config.twilio.sid;
var authToken = config.twilio.token;
var twilioClinet = require('twilio')(accountSid, authToken);


module.exports = {
    sendSMS: function (to, msg, code, cb) {
        if (smsPermission(code)) {
            if (!_.isNil(to)) {
                twilioClinet.messages.create({
                    body: msg,
                    to: to,
                    from: config.twilio.phone
                }, function (error, message) {
                    if (!error) {
                        console.log('Message sent on: ' + message.dateCreated);
                        if (typeof cb === "function") {
                            cb(null, message.status);
                        } else if (typeof code === "function") {
                            code(null, message.status);
                        }
                    } else {
                        console.error('Oops! There was an error during sending message ' + error);
                        console.error('Failed! ' + msg);
                        if (typeof cb === "function") {
                            cb(error, null);
                        } else if (typeof code === "function") {
                            code(error, null);
                        }
                    }
                });
            }
        }
    }
};

function smsPermission(code) {
    if(code == undefined || code == null || typeof code === "function"){
        return true;
    } else if(code == 1 || code ==2) {
        return true;
    } else {
        return false;
    }
}