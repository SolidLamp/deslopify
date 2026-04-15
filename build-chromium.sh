#! /bin/bash

boolInput() {
    read input
    if [ "$input" = "y" ] || [ "$input" = "Y" ]; then
        return 1
    else
        return 0
    fi
}


if ! command -v gawk &> /dev/null; then
    echo "Dependency Error: GNU Awk is required"
    exit 127
fi


if ! command -v zip &> /dev/null; then
    echo "Dependency Error: zip is required"
    exit 127
fi


if [ ! -d src ]; then
    echo "File Error: Source directory is missing!"
    exit 255
fi


if [ -d dist ]; then
    echo "/dist directory already exists. Replace? (Y/N) "
    boolInput
    if [ $? -eq 0 ]; then
        echo "Did not replace /dist directory. Exiting..."
        exit 0
    fi
else
    mkdir dist
fi


if [ ! -d dist/src ]; then
    mkdir dist/src
fi


# Copy source code to dist, and move to the new directory
cp -r src dist
cd dist/src


if [ ! -f manifest.json ]; then
    echo "File Error: manifest.json is missing!"
    exit 1
fi


if [ ! -f deslopify.js ]; then
    echo "File Error: deslopify.js is missing!"
    exit 1
fi


if [ ! -f blocklist.json ]; then
    echo "File Error: blocklist.json is missing!"
    exit 1
fi


if [ ! -f background.js ]; then
    echo "File Error: background.js is missing!"
    exit 1
fi

gawk '{gsub(/browser\./, "chrome.")}1' deslopify.js > deslopifycrx.js
gawk '{gsub(/browser\./, "chrome.")}1' background.js > backgroundcrx.js

rm deslopify.js
mv deslopifycrx.js ./deslopify.js

rm background.js
mv backgroundcrx.js ./background.js

cd ..
pwd

zip -r deslopify.zip ./src

echo "Created deslopify.zip!"

exit 0


