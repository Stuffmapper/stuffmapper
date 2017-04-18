#!/bin/bash

# This is the main entry point for Vagrant provisioning (which happens
# only once, whenever a new VM is created, or when manually executed).
# This file will be executed within the Vagrant powered VM immediately
# after it is created and can be executed again via the
# "vagrant provision" command.

echo "Provisioning VM..."

if [ -e "/etc/vagrant-provisioned" ]; then
    echo "Vagrant provisioning already completed. Skipping..."
    exit 0
fi

echo "Starting Vagrant provisioning process..."

# Install core components
/vagrant/scripts/install_build_tools.sh

sudo npm i -g npm ionic bower forever gulp cordova ionic

cd /project
npm install
bower install --allow-root
sudo su postgres -c "psql -f ./init/db.sql"
# need to add to gulp
cp -r /project/src/js/lib /project/stuffmapper/web/js/
gulp
echo "All done!"
echo "Provisioned VM..."
