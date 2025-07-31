#!/bin/bash

# give permission for everything in the CoolBro Develop App directory
sudo chmod -R 777 /home/ubuntu/CoolBro-API

# navigate into our working directory where we have all our GitHub files
cd /home/ubuntu/CoolBro-API

# add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

# install pm2 if it is not installed
if ! command -v pm2 &> /dev/null
then
    echo "pm2 is not installed, installing now..."
    sudo npm install -g pm2
fi

# install node modules
sudo npm install

# stop the pm2 process if it is already running
if pm2 list | grep -q "AHDevelop"
then
    pm2 stop AHDevelop
fi

# start our node app using pm2
pm2 start app.js --name "AHDevelop"
