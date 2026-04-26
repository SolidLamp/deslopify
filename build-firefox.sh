#! /bin/bash

bold=$(tput bold)
normal=$(tput sgr0)


if [ ! -d dist ]; then
    echo "File Error: dist/ is missing!"
fi

if [ ! -d dist/common ]; then
    echo "File Error: dist/common is missing!"
fi


if [ ! -d dist/firefox ]; then
    mkdir dist/firefox
fi


# Copy source code to dist, and move to the new directory
cp -a dist/common/. dist/firefox
cd dist/firefox


if [ ! -f manifest-firefox.json ]; then
    echo "File Error: manifest-firefox.json is missing!"
    exit 1
fi

mv manifest-firefox.json ./manifest.json

if [ ! -f manifest-chromium.json ]; then
    rm ./manifest-chromium.json
fi

cd ..
pwd


# Check that .zip not already there
if [ -f deslopify-firefox.zip ]; then
    rm ./deslopify-firefox.zip
fi


cd ./firefox

zip -r ../deslopify-firefox.zip .

echo "${bold}Created deslopify-firefox.zip!${normal}"

exit 0


