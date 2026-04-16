#! /bin/bash

bold=$(tput bold)
normal=$(tput sgr0)


if [ ! -d dist ]; then
    echo "File Error: dist/ is missing!"
fi

if [ ! -d dist/common ]; then
    echo "File Error: dist/common is missing!"
fi


if [ ! -d dist/chromium ]; then
    mkdir dist/chromium
fi


# Copy source code to dist, and move to the new directory
cp -a dist/common/. dist/chromium
cd dist/chromium


if [ ! -f manifest-chromium.json ]; then
    echo "File Error: manifest-chromium.json is missing!"
    exit 1
fi

gawk '{gsub(/browser\./, "chrome.")}1' deslopify.js > deslopifycrx.js
gawk '{gsub(/browser\./, "chrome.")}1' background.js > backgroundcrx.js

rm deslopify.js
mv deslopifycrx.js ./deslopify.js

rm background.js
mv backgroundcrx.js ./background.js

mv manifest-chromium.json ./manifest.json

if [ ! -f manifest-firefox.json ]; then
    rm ./manifest-firefox.json
fi

cd ..
pwd

zip -r deslopify-chromium.zip ./chromium

echo "${bold}Created deslopify-chromium.zip!${normal}"

exit 0


