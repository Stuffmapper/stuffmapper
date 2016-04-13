cd ~
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

sudo apt-get install git nodejs postgresql ngnix

npm i -g cordova ionic bower pm2

git clone https://github.com/RyantheFarmer/stuffmapper.git

cd stuffmapper

npm i

bower i

ionic hooks add

ionic state restore

touch .bash_aliases

echo 'alias devStuff="cd ~/stuffmapper && node ~/stuffmapper/bin/www"' >> ~/.bash_aliases
echo 'alias runStuff="cd ~/stuffmapper && pm2 bin/www"' >> ~/.bash_aliases
echo 'alias appStuff="cd ~/stuffmapper && ionic serve --lab"' >> ~/.bash_aliases

sudo rm /etc/nginx/sites-enabled/default

sudo touch /etc/nginx/sites-available/node

sudo echo "\
server {\n\
    listen 80;\n\
    server_name stuffmapper.com www.stuffmapper.com;\n\
\n\
    location / {\n\
        proxy_set_header   X-Forwarded-For $remote_addr;\n\
        proxy_set_header   Host $http_host;\n\
        proxy_pass         "http://127.0.0.1:3000";\n\
    }\n\
}\n\
\n\
server {\n\
    listen 443;\n\
    server_name stuffmapper.com www.stuffmapper.com;\n\
\n\
    location / {\n\
        proxy_set_header   X-Forwarded-For $remote_addr;\n\
        proxy_set_header   Host $http_host;\n\
        proxy_pass         "https://127.0.0.1:3001";\n\
    }\n\
}\n\
\n\
" >> /etc/nginx/sites-available/node

sudo ln -s /etc/nginx/sites-available/node /etc/nginx/sites-enabled/node
sudo service nginx restart

devStuff
