cd ~
# grab the newest version of node 4.x
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
# install dependencies from apt-get
sudo apt-get install git nodejs postgresql nginx -y
# install global dependencies from npm
sudo npm i -g cordova ionic bower pm2 gulp
# clone the code from github into the stuffmapper folder
git clone https://github.com/RyantheFarmer/stuffmapper.git
# move into ~/stuffmapper to perform next tasks
cd stuffmapper
# install all backend dependencies listed in package.json for nodejs
npm i
# install all frontend dependencies listed in bower.config in
#  the folder listed in .bowerrc
bower i
# install ionic dependencies
ionic hooks add
ionic state restore
# build Jade and Sass files
gulp
# ensure that .bash_aliases exists and add some super
#  useful commands for stuff!
touch .bash_aliases
echo 'alias devStuff="cd ~/stuffmapper && node ~/stuffmapper/bin/www"' >> ~/.bash_aliases
echo 'alias runStuff="cd ~/stuffmapper && pm2 bin/www"' >> ~/.bash_aliases
echo 'alias appStuff="cd ~/stuffmapper && ionic serve --lab"' >> ~/.bash_aliases
# remove default nginx sites-enabled file
sudo rm /etc/nginx/sites-enabled/default
# make our own sites-available file and link it to sites-enabled
sudo touch /etc/nginx/sites-available/node
# create the file with our server setup
sudo echo -e "\
server {\n\
    listen 80;\n\
    server_name stuffmapper.com www.stuffmapper.com;\n\
\n\
    location / {\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection \"upgrade\";\n\
        proxy_http_version 1.1;\n\
        proxy_set_header   X-Forwarded-For \$remote_addr;\n\
        proxy_set_header   Host \$http_host;\n\
        proxy_pass         \"http://127.0.0.1:3000\";\n\
    }\n\
}\n\
\n\
server {\n\
    listen 443;\n\
    server_name stuffmapper.com www.stuffmapper.com;\n\
\n\
    location / {\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection \"upgrade\";\n\
        proxy_http_version 1.1;\n\
        proxy_set_header   X-Forwarded-For \$remote_addr;\n\
        proxy_set_header   Host \$http_host;\n\
        proxy_pass         \"https://127.0.0.1:3001\";\n\
    }\n\
}\n\
\n\
" | sudo tee --append /etc/nginx/sites-available/node > /dev/null
# create link
sudo ln -s /etc/nginx/sites-available/node /etc/nginx/sites-enabled/node
# update nginx config
sudo service nginx restart
# bam.  All done.
echo ""
echo "All done!"
