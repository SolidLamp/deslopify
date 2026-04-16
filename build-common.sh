#! /bin/bash

bold=$(tput bold)
normal=$(tput sgr0)

boolInput() {
    read input
    if [ "$input" = "y" ] || [ "$input" = "Y" ]; then
        return 1
    else
        return 0
    fi
}


if [ ! -d src ]; then
    echo "File Error: Source directory is missing!"
    exit 255
fi


if [ -d dist ]; then
    echo "/dist directory already exists. Replace? (Y/N) "
    boolInput
    if [ $? -eq 0 ]; then
        echo "Did not replace /dist directory. Exiting..."
        exit 2
    fi
else
    mkdir dist
fi


if [ ! -d dist/common ]; then
    mkdir dist/common
fi


# Copy source code to dist, and move to the new directory
cp -a src/. dist/common
cd dist/common


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

echo "${bold}Built Deslopify!${normal}"

exit 0


