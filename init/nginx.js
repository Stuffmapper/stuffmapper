#!/usr/bin/node
// server {
//     listen 80;
//     server_name gophers.stuffmapper.com;
//     return 301 https://gophers.stuffmapper.com$request_uri;
// }
//
// server {
//     listen 443 ssl;
//     server_name gophers.stuffmapper.com;
//
//     client_max_body_size 10M;
//
//     ssl_certificate           /etc/nginx/ssl/cert.pem;
//     ssl_certificate_key       /etc/nginx/ssl/cert.key;
//
//     ssl on;
//     ssl_session_cache  builtin:1000  shared:SSL:10m;
//     ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;
//     ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
//     ssl_prefer_server_ciphers on;
//
//     access_log /var/log/nginx/test-stuffmapper.access.log;
//
//     root /home/ubuntu/test-stuffmapper/web/;
//
//     location / {
//         try_files $uri @nodejs;
//     }
//
//     location @nodejs {
//         proxy_pass http://localhost:3001;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//         proxy_set_header X-Real-IP $remote_addr;
//         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//         proxy_set_header X-Forwarded-Proto $scheme;
//         proxy_read_timeout 90;
//         proxy_redirect http://localhost:3001 https://gophers.stuffmapper.com;
//     }
//   }
var fs = require('fs');
var path = require('path');

var nginxFile = '';
addToFile([['ducks','development'],['gophers','test']]);
function addToFile(users) {
	if(!users.length) return fs.writeFile('/etc/nginx/sites-available/node', nginxFile, function(err, data){if(err){return console.log(err);}});
	var user = users.pop();
	fs.readFile('/home/'+user[0]+'/stuffmapper/config.json', 'utf8', function(err, res) {
		if(err) return addToFile(users);
		var jsonRes = JSON.parse(res);
		nginxFile += [
			'server {',
			'    listen 80;',
			'    server_name '+user[0]+'.stuffmaper.com;',
			'    return 301 https://'+user[0]+'.stuffmaper.com$request_uri;',
			'}',
			'server {',
			'    listen 443 ssl;',
			'    server_name '+user[0]+'.stuffmapper.com;',
			'    ssl_certificate        /etc/nginx/ssl/cert.pem;',
			'    ssl_certificate_key    /etc/nginx/ssl/cert.key;',
			'    location /styleguide/ {',
			'        alias /home/'+user[0]+'/stuffmapper-styleguide/www/;',
			'        autoindex on;',
			'    }',
			'    location / {',
			'        root /home/'+user[0]+'/stuffmapper/www/;',
			'        autoindex on;',
			'        proxy_pass http://localhost:'+jsonRes[user[1]].port+';',
			'        proxy_http_version 1.1;',
			'        proxy_set_header Upgrade $http_upgrade;',
			'        proxy_set_header Connection \'upgrade\';',
			'        proxy_set_header Host $host;',
			'        proxy_cache_bypass $http_upgrade;',
			'    }',
			'}'
		].join('\n') + '\n';
		addToFile(users);
	});
}
