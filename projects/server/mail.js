var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');

var template_name = "dibber-notification-1";
var template_content = [{
	"name":"FIRSTNAME",
	"content":"Delaney"
},{
	"name":"ITEMIMAGE",
	"content":"http://cdn.stuffmapper.com/test/1464416108525.jpg"
},{
	"name":"CHATLINK",
	"content":"http://ducks.stuffmapper.com/stuff/my/messages/1"
},{
	"name":"MYSTUFFLINK",
	"content":"http://ducks.stuffmapper.com/stuff/get/4"
},{
	"name":"ITEMTITLE",
	"content":"Balloon!"
}];
var message = {
	"html": "<p>Example HTML content</p>",
	"text": "Example text content",
	"subject": "You Dibbsed a Balloon",
	"from_email": "supporty@stuffmapper.com",
	"from_name": "Stuffmapper Supporty",
	"to": [{
		"email": "delaney.cunningham@gmail.com",
		"name": "Delaney Cunningham",
		"type": "to"
	},{
		"email": "ryan.the.farmer@gmail.com",
		"name": "Delaney Cunningham",
		"type": "to"
	}],
	"headers": {
		"Reply-To": "no_reply@stuffmapper.com"
	},
	"merge": true,
	"merge_language": "mailchimp",
	"global_merge_vars": template_content
};
var async = false;
var ip_pool = "Main Pool";
mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async, "ip_pool": ip_pool/*, "send_at": send_at*/}, function(result) {
	console.log(result);
}, function(e) {
	console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
});
