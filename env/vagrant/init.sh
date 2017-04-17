cd /vagrant/
sudo apt-get install make redis-server git nodejs nodejs-legacy npm postgresql nginx g++ python -y
sudo npm i -g ionic bower forever gulp
cd stuffmapper-styleguide
npm i
bower i
cd ..
cd stuffmapper
sudo su postgres -c "psql -f ./init/db.sql"
npm i
bower i
# need to add to gulp
cp -r ./src/js/lib ./web/js/
ionic hooks add
sudo ionic state restore
sudo chown -R $user:$user ./*
gulp
echo "All done!"
