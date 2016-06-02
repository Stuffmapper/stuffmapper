cd /home/$user/
# ensure that .bash_aliases exists and add some super
#  useful commands for stuff!
touch .bash_aliases
echo 'alias devStuff="cd ~/stuffmapper/projects/ && node ./app.js"' >> ./.bash_aliases
echo 'alias runStuff="cd ~/stuffmapper/projects/ && pm2 app.js"' >> ./.bash_aliases
echo 'alias appStuff="cd ~/stuffmapper && ionic serve --lab"' >> ./.bash_aliases
echo 'alias gulpStuff="cd ~/stuffmapper && gulp && gulp watch"' >> ./.bash_aliases
# grab the newest version of node 4.x
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
# install dependencies from apt-get
sudo apt-get install make git nodejs postgresql nginx g++ python -y
# clone the code from github into the stuffmapper folder
git clone https://github.com/RyantheFarmer/stuffmapper.git
# move into ~/stuffmapper to perform next tasks
cd stuffmapper
# install all backend dependencies listed in package.json for nodejs
npm i
# install global dependencies from npm
sudo npm i -g cordova ionic bower pm2 gulp electron-prebuilt
# install all frontend dependencies listed in bower.config in
#  the folder listed in .bowerrc
bower i
# install ionic dependencies
ionic hooks add
sudo ionic state restore
sudo chown -R $user:$user ./*
# build Jade and Sass files
gulp
# remove default nginx sites-enabled file
sudo rm /etc/nginx/sites-enabled/default
# make our own sites-available file and link it to sites-enabled
sudo rm -rf /etc/nginx/sites-available/node
sudo rm -rf /etc/nginx/sites-enabled/node
sudo touch /etc/nginx/sites-available/node
# create the file with our server setup
sudo echo -e "\
server {\n\
    listen 80;\n\
    server_name stuffmapper.com www.stuffmapper.com;\n\
    return 301 https://www.stuffmapper.com\$request_uri;\n\
}\n\
server {\n\
    listen 443;\n\
    server_name stuffmapper.com;\n\
    return 301 https://www.stuffmapper.com\$request_uri;\n\
}\n\
server {\n\
    listen 80;\n\
    server_name ducks.stuffmapper.com;\n\
    return 301 https://\$host\$request_uri;\n\
}\n\
server {\n\
    listen 80;\n\
    server_name bears.stuffmapper.com;\n\
    return 301 https://\$host\$request_uri;\n\
}\n\
server {\n\
    listen 80;\n\
    server_name gophers.stuffmapper.com;\n\
    return 301 https://\$host\$request_uri;\n\
}\n\
server {\n\
    listen 443;\n\
    server_name ducks.stuffmapper.com;\n\
\n\
    ssl_certificate           /etc/nginx/cert.crt;\n\
    ssl_certificate_key       /etc/nginx/cert.key;\n\
\n\
    ssl on;\n\
    ssl_session_cache  builtin:1000  shared:SSL:10m;\n\
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;\n\
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;\n\
    ssl_prefer_server_ciphers on;\n\
\n\
    access_log /var/log/nginx/stuffmapper.access.log;\n\
\n\
    root /home/ducks/stuffmapper/projects/web/;\n\
\n\
    location / {\n\
        try_files \$uri @nodejs;\n\
    }\n\
\n\
    location @nodejs {\n\
        proxy_pass http://localhost:3001;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection 'upgrade';\n\
        proxy_set_header Host \$host;\n\
        proxy_cache_bypass \$http_upgrade;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \$scheme;\n\
        proxy_read_timeout 90;\n\
        proxy_redirect http://localhost:3001 https://ducks.stuffmapper.com;\n\
    }\n\
  }\
\n\
server {\n\
    listen 443;\n\
    server_name gophers.stuffmapper.com;\n\
\n\
    ssl_certificate           /etc/nginx/cert.crt;\n\
    ssl_certificate_key       /etc/nginx/cert.key;\n\
\n\
    ssl on;\n\
    ssl_session_cache  builtin:1000  shared:SSL:10m;\n\
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;\n\
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;\n\
    ssl_prefer_server_ciphers on;\n\
\n\
    access_log /var/log/nginx/stuffmapper.access.log;\n\
\n\
    root /home/gophers/stuffmapper/projects/web/;\n\
\n\
    location / {\n\
        try_files \$uri @nodejs;\n\
    }\n\
\n\
    location @nodejs {\n\
        proxy_pass http://localhost:3002;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection 'upgrade';\n\
        proxy_set_header Host \$host;\n\
        proxy_cache_bypass \$http_upgrade;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \$scheme;\n\
        proxy_read_timeout 90;\n\
        proxy_redirect http://localhost:3002 https://gophers.stuffmapper.com;\n\
    }\n\
  }\
\n\
server {\n\
    listen 443;\n\
    server_name bears.stuffmapper.com;\n\
\n\
    ssl_certificate           /etc/nginx/cert.crt;\n\
    ssl_certificate_key       /etc/nginx/cert.key;\n\
\n\
    ssl on;\n\
    ssl_session_cache  builtin:1000  shared:SSL:10m;\n\
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;\n\
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;\n\
    ssl_prefer_server_ciphers on;\n\
\n\
    access_log /var/log/nginx/stuffmapper.access.log;\n\
\n\
    root /home/bears/stuffmapper/projects/web/;\n\
\n\
    location / {\n\
        try_files \$uri @nodejs;\n\
    }\n\
\n\
    location @nodejs {\n\
        proxy_pass http://localhost:3003;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection 'upgrade';\n\
        proxy_set_header Host \$host;\n\
        proxy_cache_bypass \$http_upgrade;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \$scheme;\n\
        proxy_read_timeout 90;\n\
        proxy_redirect http://localhost:3003 https://bears.stuffmapper.com;\n\
    }\n\
  }\
\n\
server {\n\
    listen 443;\n\
    server_name www.stuffmapper.com;\n\
\n\
    ssl_certificate           /etc/nginx/cert.crt;\n\
    ssl_certificate_key       /etc/nginx/cert.key;\n\
\n\
    ssl on;\n\
    ssl_session_cache  builtin:1000  shared:SSL:10m;\n\
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;\n\
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;\n\
    ssl_prefer_server_ciphers on;\n\
\n\
    access_log /var/log/nginx/stuffmapper.access.log;\n\
\n\
    root /home/stuffmapper/stuffmapper/projects/web/;\n\
\n\
    location / {\n\
        try_files \$uri @nodejs;\n\
    }\n\
\n\
    location @nodejs {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection 'upgrade';\n\
        proxy_set_header Host \$host;\n\
        proxy_cache_bypass \$http_upgrade;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \$scheme;\n\
        proxy_read_timeout 90;\n\
        proxy_redirect http://localhost:3000 https://www.stuffmapper.com;\n\
    }\n\
  }\
" | sudo tee --append /etc/nginx/sites-available/node > /dev/null
# create link
sudo ln -s /etc/nginx/sites-available/node /etc/nginx/sites-enabled/node
# update nginx config
sudo service nginx restart
# init the db
# bam.  All done.
echo ""
echo "All done!"
