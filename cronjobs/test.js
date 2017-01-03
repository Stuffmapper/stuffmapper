#!/usr/bin/node
var pg = require('pg');
var pgUser = 'stuffmapper';
var pgDb = 'stuffmapper4';
var pgPass = 'SuperSecretPassword1!';
var pgHost = 'localhost';
var conString = 'postgres://'+pgUser+':'+pgPass+'@'+pgHost+':5432/'+pgDb;

var jobs = 1;
var completeJobs = 0;

var config = {
	user: pgUser,
	database: pgDb,
	password: pgPass,
	host: pgHost,
	port: 5432,
	max: 10,
	idleTimeoutMillis: 1000
};

var pool = new pg.Pool(config);
pool.connect(function(err, client, done) {
	if(err) return console.error('error fetching client from pool', err);
	client.query('SELECT * FROM conversations WHERE archived = false', [], function(err, result1) {
		if(err) return console.error('error running query', err);
		var conversations = result1.rows.length;
		var conversation_counter = 0;
		result1.rows.forEach(function(e, i) {
			client.query('SELECT * FROM messages WHERE conversation_id = $1 AND archived = false ORDER BY date_created DESC LIMIT 1 ', [e.id], function(err,result2) {
				var lastMessage = result2.rows[0];
				var convTime = new Date(e.date_created).getTime();
				var messTime = lastMessage?new Date(lastMessage.date_created).getTime():0;
				var currTime = new Date().getTime();
				var convAgeMin = new Date(currTime - convTime).getUTCMinutes();
				var messAgeMin = new Date(currTime - messTime).getUTCMinutes();
				if(!lastMessage && convAgeMin >= 15) undib(e.post_id, e.dibber_id);
				else if(lastMessage && !lastMessage.emailed && messAgeMin >= 5) messageUserMessageReminder(((lastMessage.user_id===e.lister_id)?e.dibber_id:e.lister_id), e.id, e.post_id);
				if(++conversation_counter === conversations) jobsDone(done);
			});
		});
	});
});

pool.on('error', function(err, client) {
	console.error('idle client error', err.message, err.stack);
});

function undib(post_id, user_id) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) return client.end();
		var query = [
			'UPDATE posts SET dibber_id = NULL, dibbed = false',
			'WHERE dibbed = true AND id = $2 AND dibber_id = $1',
			'RETURNING *'
		].join(' ');
		var values = [
			user_id,
			post_id
		];
		client.query(query, values, function(err, result1) {
			if(err) return client.end();
			var query = [
				'UPDATE pick_up_success SET undibbed = true, undibbed_date = current_timestamp',
				'WHERE post_id = $1 AND dibber_id = $2 AND lister_id = $3 RETURNING *'
			].join(' ');
			var values = [
				post_id,
				user_id,
				result1.rows[0].user_id
			];
			client.query(query, values, function(err, result2) {
				if(err) return client.end();
				var query = [
					'UPDATE conversations SET archived = true, date_edited = current_timestamp',
					'WHERE post_id = $1 RETURNING *'
				].join(' ');
				client.query(query, [post_id], function(err, result3) {
					if(err) return client.end();
					var query = 'SELECT uname, email FROM users WHERE id = $1';
					var values = [user_id];
					client.query(query, values, function(err, result4){
						if(err) return client.end();
						query = 'SELECT image_url FROM images WHERE post_id = $1 AND main = true';
						client.query(query, [post_id], function(err, result5) {
							if(err) return client.end();
							sendTemplate(
								'dibs-expired',
								'Your Dibs has expired',
								{[result4.rows[0].uname]:result4.rows[0].email},
								{
									'FIRSTNAME' : result4.rows[0].uname,
									'ITEMTITLE':result1.rows[0].title,
									'ITEMNAME':result1.rows[0].title,
									'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url
								}
							);
							return client.end();
						});
					});
				});
			});
		});
	});
}

function messageUserMessageReminder(user_id, conversation_id, post_id) {
	queryServer('SELECT * FROM messages WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false ORDER BY date_created ASC', [user_id, conversation_id], function(result1) {
		queryServer('SELECT uname, email FROM users WHERE id = $1', [user_id], function(result2){
			queryServer('UPDATE messages SET emailed = true WHERE conversation_id = $2 AND read = false and not user_id = $1 and archived = false and emailed = false', [user_id, conversation_id], function(result10) {
				queryServer('SELECT title, id FROM posts WHERE id = $1', [post_id], function(result3) {
					queryServer('SELECT image_url FROM images WHERE post_id = $1 AND main = true', [post_id], function(result5) {
						var test = [];
						result1.rows.forEach(function(e){test.push(e.message);});
						sendTemplate(
							'message-notification',
							'You received a message!',
							{[result2.rows[0].uname]:result2.rows[0].email},
							{
								'FIRSTNAME' : result2.rows[0].uname,
								'USERNAME' : result2.rows[0].uname,
								'ITEMTITLE':result3.rows[0].title,
								'ITEMNAME':result3.rows[0].title,
								'CHATLINK':'https://gophers.stuffmapper.com/stuff/my/'+post_id+'/messages',
								'ITEMIMAGE':'https://cdn.stuffmapper.com'+result5.rows[0].image_url,
								'MESSAGE':test.join('<br>')
							}
						);
					});
				});
			});
		});
	});
}

function jobsDone() {
	if(++completeJobs === jobs) {
		if(arguments) {
			for(var i = 0; i < Object.keys(arguments).length; i++) {
				if(typeof arguments[i] === 'function') process.nextTick(arguments[i]);
			}
		}
	}
}

function queryServer(query, values, cb) {
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) return client.end();
		client.query(query, values, function(err, result) {
			if(err) return client.end();
			client.end();
			cb(result);
		});
	});
}

function sendTemplate(template, subject, to, args) {
	var mandrill = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
	var template_name = template;
	var template_content = [];
	Object.keys(args).forEach(function(e) {
		template_content.push({
			'name' : e,
			'content' : args[e]
		});
	});
	var emailTo = [];
	Object.keys(to).forEach(function(e) {
		emailTo.push({
			'email': to[e],
			'name': e,
			'type': 'to'
		});
	});
	var message = {
		'subject': subject,
		'from_email': 'support@stuffmapper.com',
		'from_name': 'Stuffmapper Support',
		'to': emailTo,
		'headers': { 'Reply-To': 'no_reply@stuffmapper.com' },
		'merge': true,
		'merge_language': 'mailchimp',
		'global_merge_vars': template_content
	};
	mandrill_client.messages.sendTemplate({'template_name': template_name, 'template_content': template_content, 'message': message, 'async': false, 'ip_pool': 'Main Pool'}, function(result) {
		console.log(result);
	}, function(e) {
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}
