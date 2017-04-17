#!/bin/bash

# This is the main entry point for Vagrant provisioning.  This file will be
# executed within the Vagrant powered VM immediately after it is created and
# can be executed again via the "vagrant provision" command.

sudo apt-get install make redis-server git nodejs nodejs-legacy npm postgresql nginx g++ python -y
sudo npm i -g ionic bower forever gulp
cd /project/stuffmapper-styleguide
npm i
bower i
cd ..
cd /project/stuffmapper
npm i
bower i
sudo su postgres -c "psql -f ./init/db.sql"
# need to add to gulp
cp -r /project/stuffmapper/src/js/lib /project/stuffmapper/web/js/
ionic hooks add
sudo ionic state restore
sudo chown -R $user:$user ./*
gulp
echo "All done!"
