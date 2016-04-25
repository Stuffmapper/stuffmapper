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
