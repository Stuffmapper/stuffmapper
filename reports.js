#!/usr/bin/node
var pg = require('pg');
var pgUser = 'stuffmapper';
var pgDb = 'stuffmapper1';
var pgPass = 'SuperSecretPassword1!';
var pgHost = 'localhost';
var config = {
	user: pgUser,
	database: pgDb,
	password: pgPass,
	host: pgHost,
	port: 5432,
	max: 10,
	idleTimeoutMillis: 1000
};


var table = '<style>table {border-collapse: collapse;}table, tr, td {border: 1px solid black;}</style><table>';
var pool = new pg.Pool(config);
pool.connect(function(err, client, done) {
	if(err) return console.error('error fetching client from pool', err);
	client.query('select users.fname, users.lname, users.email from pick_up_success, users where pick_up_success.rejected = true AND users.id = pick_up_success.dibber_id', function(err,res){
		var len = res.rows.length;
		var val = '';
		for(var i = 0; i < len; i++){
			val += JSON.stringify(res.rows[i]) + ' ';
		}
		table += addRow('Dibs were rejected by the lister',val.trim());
		client.query('SELECT users.fname, users.lname, users.email from posts, users where posts.archived = true AND posts.attended = false AND users.id = posts.dibber_id', function(err,res){
			var len = res.rows.length;
			var val = '';
			for(var i = 0; i < len; i++){
				val += JSON.stringify(res.rows[i]) + ' ';
			}
			table += addRow('Dibs\'d unattended items that were deleted by the lister',val.trim());
			client.query('SELECT count(*) FROM posts', function(err,res){
				var len = res.rows.length;
				var val = '';
				for(var i = 0; i < len; i++){
					val += JSON.stringify(res.rows[i]) + ' ';
				}
				table += addRow('# of absolute items listed',val.trim());
				client.query('select count(*) from posts, users where users.id = posts.id', function(err,res){
					var len = res.rows.length;
					var val = '';
					for(var i = 0; i < len; i++){
						val += JSON.stringify(res.rows[i]) + ' ';
					}
					table += addRow('# of total listers',val.trim());
					client.query('SELECT count(*) FROM posts WHERE date_created > current_date - interval \'1\' day', function(err,res){
						var len = res.rows.length;
						var val = '';
						for(var i = 0; i < len; i++){
							val += JSON.stringify(res.rows[i]) + ' ';
						}
						table += addRow('# of daily listings',val.trim());
						client.query('SELECT uname, fname, lname, email from users order by date_created', function(err,res){
							var len = res.rows.length;
							var val = '';
							for(var i = 0; i < len; i++){
								val += JSON.stringify(res.rows[i]) + ' ';
							}
							table += addRow('Entire list of signups',val.trim());
							client.query('select count(*) from users, posts where users.date_created > current_date - interval \'1\' day AND posts.date_created > current_date - interval \'1\' day AND posts.user_id = users.id', function(err,res){
								var len = res.rows.length;
								var val = '';
								for(var i = 0; i < len; i++){
									val += JSON.stringify(res.rows[i]) + ' ';
								}
								table += addRow('# of daily signups that list an item',val.trim());
								client.query('select count(*) from users, posts where users.date_created > current_date - interval \'1\' day AND posts.dibber_id = users.id', function(err,res){
									var len = res.rows.length;
									var val = '';
									for(var i = 0; i < len; i++){
										val += JSON.stringify(res.rows[i]) + ' ';
									}
									table += addRow('# of daily signups that Dibs an item',val.trim());
									client.query('select count(*) from conversations where date_created > current_date - interval \'1\' day', function(err,res){
										var len = res.rows.length;
										var val = '';
										for(var i = 0; i < len; i++){
											val += JSON.stringify(res.rows[i]) + ' ';
										}
										table += addRow('# of daily unique conversations',val.trim());
										client.query('SELECT count(*) from pick_up_success where pick_up_success = true and pick_up_date > current_date - interval \'1\' day', function(err,res){
											var len = res.rows.length;
											var val = '';
											for(var i = 0; i < len; i++){
												val += JSON.stringify(res.rows[i]) + ' ';
											}
											table += addRow('Daily uptick of landfill tracker',val.trim());
											client.query('select count(DISTINCT users.id) from users, posts where posts.dibber_id = users.id', function(err,res){
												var len = res.rows.length;
												var val = '';
												for(var i = 0; i < len; i++){
													val += JSON.stringify(res.rows[i]) + ' ';
												}
												table += addRow('# of total Dibbers',val.trim());
												client.query('select count(*) from pick_up_success where pick_up_init > current_date - interval \'1\' day', function(err,res){
													var len = res.rows.length;
													var val = '';
													for(var i = 0; i < len; i++){
														val += JSON.stringify(res.rows[i]) + ' ';
													}
													table += addRow('# of daily Dibs',val.trim());
													client.query('select count(*) from pick_up_success where rejected = true AND pick_up_init > current_date - interval \'1\' day', function(err,res){
														var len = res.rows.length;
														var val = '';
														for(var i = 0; i < len; i++){
															val += JSON.stringify(res.rows[i]) + ' ';
														}
														table += addRow('# of daily Rejected Dibs',val.trim());
														done();
														allDone();
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

function allDone() {
	table += '\n<table>';
	console.log(table);
	var mandrill = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill('eecqPlsFBCU6tPAyNb6MLg');
	var emailTo = [];
	// var to = {'Ryan Farmer' : 'ryan.the.farmer@gmail.com','Benjamin Zuercher' : 'bbzuercher1@gmail.com'};
	var to = {'Stuffmapper' : 'stuffmapper@gmail.com', 'Delaney Cunningham' : 'delaney.cunningham@gmail.com', 'Christine Day' : 'good4artseattle@gmail.com'};
	Object.keys(to).forEach(function(e) {
		emailTo.push({
			"email" : to[e],
			"name" : e,
			"type": "to"
		});
	});
	var message = {
		"subject": "Daily Report",
		"html": table,
		"from_email": "support@stuffmapper.com",
		"from_name": "Stuffmapper Support",
		"to": emailTo,
		"headers": { "Reply-To": "no_reply@stuffmapper.com" },
		"merge": true,
		"merge_language": "mailchimp"
	};
	mandrill_client.messages.send({ message: message, async: false, ip_pool: "Main Pool"}, function(result) {
		console.log(result);
	}, function(e) {
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}

function addRow(name, value) {
	return '\n\t<tr>\n\t\t<td>'+name+'</td>\n\t\t<td>'+value+'</td>\n\t</tr>';
}
