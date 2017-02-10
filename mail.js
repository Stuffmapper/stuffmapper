// var mandrill = require('mandrill-api/mandrill');
// var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
//
// var template_name = "dibber-notification-1";
// var template_content = [{
// 	"name":"FIRSTNAME",
// 	"content":"Delaney"
// },{
// 	"name":"ITEMIMAGE",
// 	"content":"http://cdn.stuffmapper.com/test/1464416108525.jpg"
// },{
// 	"name":"CHATLINK",
// 	"content":"https://www.stuffmapper.com/stuff/my/messages/1"
// },{
// 	"name":"MYSTUFFLINK",
// 	"content":"https://www.stuffmapper.com/stuff/get/4"
// },{
// 	"name":"ITEMTITLE",
// 	"content":"Balloon!"
// }];
// var message = {
// 	"html": "<p>Example HTML content</p>",
// 	"text": "Example text content",
// 	"subject": "You Dibbsed a Balloon",
// 	"from_email": "supporty@stuffmapper.com",
// 	"from_name": "Stuffmapper Supporty",
// 	"to": [{
// 		"email": "delaney.cunningham@gmail.com",
// 		"name": "Delaney Cunningham",
// 		"type": "to"
// 	},{
// 		"email": "ryan.the.farmer@gmail.com",
// 		"name": "Delaney Cunningham",
// 		"type": "to"
// 	}],
// 	"headers": {
// 		"Reply-To": "no_reply@stuffmapper.com"
// 	},
// 	"merge": true,
// 	"merge_language": "mailchimp",
// 	"global_merge_vars": template_content
// };
// var async = false;
// var ip_pool = "Main Pool";
// mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async, "ip_pool": ip_pool/*, "send_at": send_at*/}, function(result) {
// 	console.log(result);
// }, function(e) {
// 	console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
// });



function sendTemplate(template, subject, to, args) {
	var mandrill = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
	var template_name = template;
	var template_content = [];
	Object.keys(args).forEach(function(e) {
		template_content.push({
			"name" : e,
			"content" : args[e]
		});
	});
	var emailTo = [];
	Object.keys(to).forEach(function(e) {
		emailTo.push({
			"email" : to[e],
			"name" : e,
			"type": "to"
		});
	});
	var message = {
		"subject": subject,
		"from_email": "support@stuffmapper.com",
		"from_name": "Stuffmapper Support",
		"to": emailTo,
		"headers": { "Reply-To": "no_reply@stuffmapper.com" },
		"merge": true,
		"merge_language": "mailchimp",
		"global_merge_vars": template_content
	};
	mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": false, "ip_pool": "Main Pool"}, function(result) {
		console.log(result);
	}, function(e) {
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}
function sendBasicText(to) {
	var mandrill = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
	var emailTo = [];
	Object.keys(to).forEach(function(e) {
		emailTo.push({
			"email" : to[e],
			"name" : e,
			"type": "to"
		});
	});
	var message = {
		"subject": "Howdy!",
		"html": "<p>Example HTML content</p>",
		"text": "Example text content",
		"from_email": "support@stuffmapper.com",
		"from_name": "Stuffmapper Support",
		"to": emailTo,
		"headers": { "Reply-To": "no_reply@stuffmapper.com" },
		"merge": true,
		"merge_language": "mailchimp"
	};
	mandrill_client.messages.send({ "message": message, "async": false, "ip_pool": "Main Pool"}, function(result) {
		console.log(result);
	}, function(e) {
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}

sendBasicText({
	'Ryan Farmer' : 'ryan.the.farmer@gmail.com',
	// 'Delaney Cunningham' : ''
});

// sendTemplate(
// 	'dibs-declined',
// 	'Dibs declined',
// 	{
// 		'Delaney Cunningham' : 'delaney.cunningham@gmail.com'
// 	},
// 	{
// 		'ITEMTITLE' : 'item title goes here',
// 		'ITEMIMAGE' : 'https://www.stuffmapper.com/img/give-pic-empty-01.png',
// 		'FIRSTNAME' : 'Delaney',
// 		'ITEMNAME' : 'item name goes here',
// 		'GETSTUFFLINK' : 'https://www.stuffmapper.com/stuff/get/1',
// 		'UPDATE_PROFILE' : 'https://www.stuffmapper.com/stuff/my/settings'
// 	}
// );
//
// sendTemplate(
// 	'email-verification',
// 	'Activate your Stuffmapper account!',
// 	{
// 		'Delaney Cunningham' : 'delaney.cunningham@gmail.com'
// 	},
// 	{
// 		'APPSTORELINK' : 'appleappstorelink',
// 		'PLAYSTORELINK' : 'playstorelink',
// 		'FIRSTNAME' : 'Delaney',
// 		'CONFIRMEMAIL' : 'http://localhost:3000/api/v1/account/verificaiton/239jr092fj9eyfoaeu9fwur',
// 		'UPDATE_PROFILE' : 'http://localhost:3000/stuff/my/settings'
// 	}
// );
//
//
// sendTemplate(
// 	'lister-notification',
// 	'Dibs! Someone wants your stuff',
// 	{
// 		'Delaney Cunningham' : 'delaney.cunningham@gmail.com'
// 	},
// 	{
// 		'ITEMTITLE' : 'item title goes here',
// 		'ITEMIMAGE' : 'https://www.stuffmapper.com/img/give-pic-empty-01.png',
// 		'FIRSTNAME' : 'Delaney',
// 		'CHATLINK' : 'https://www.stuffmapper.com/stuff/my/messages/1',
// 		'UPDATE_PROFILE' : 'https://www.stuffmapper.com/stuff/my/settings'
// 	}
// );
//
// sendTemplate(
// 	'message-notification',
// 	'Stuffmapper.com: You have a new message!',
// 	{
// 		'Delaney Cunningham' : 'delaney.cunningham@gmail.com'
// 	},
// 	{
// 		'ITEMTITLE' : 'item title goes here',
// 		'ITEMIMAGE' : 'https://www.stuffmapper.com/img/give-pic-empty-01.png',
// 		'FIRSTNAME' : 'Delaney',
// 		'USERNAME' : 'JankyToaster420',
// 		'MESSAGE' : 'I heard you like janky toasters.',
// 		'CHATLINK' : 'https://www.stuffmapper.com/stuff/my/messages/1',
// 		'CONFIRMEMAIL' : 'https://www.stuffmapper.com/api/v1/account/verificaiton/239jr092fj9eyfoaeu9fwur',
// 		'UPDATE_PROFILE' : 'https://www.stuffmapper.com/stuff/my/settings'
// 	}
// );


// sendTemplate(
// 	'notify-undib',
// 	'Your *|ITEMNAME|* has been unDibs',
// 	{
// 		'Delaney Cunningham' : 'ryan.the.farmer@gmail.com'
// 	},
// 	{
// 		'ITEMTITLE' : 'item title goes here',
// 		'ITEMIMAGE' : 'https://www.stuffmapper.com/img/give-pic-empty-01.png',
// 		'FIRSTNAME' : 'Delaney',
// 		'USERNAME' : 'JankyToaster420',
// 		'ITEMURL' : 'https://www.stuffmapper.com/stuff/get/1',
// 		'UPDATE_PROFILE' : 'https://www.stuffmapper.com/stuff/my/settings'
// 	}
// );
//
// sendTemplate(
// 	'password-reset',
// 	'Reset your Stuffmapper password',
// 	{
// 		'Delaney Cunningham' : 'delaney.cunningham@gmail.com'
// 	},
// 	{
// 		'FIRSTNAME' : 'Delaney',
// 		'CHANGEPASSWORD' : 'https://www.stuffmapper.com/changepassword/830fj238jf309fj39fj'
// 	}
// );
