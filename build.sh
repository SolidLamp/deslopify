#! /bin/bash

if ! command -v gawk &> /dev/null; then
    echo "Dependency Error: GNU Awk is required"
    exit 127
fi


if ! command -v zip &> /dev/null; then
    echo "Dependency Error: zip is required"
    exit 127
fi


if ! command -v tput &> /dev/null; then
    echo "Dependency Error: tput is required"
    exit 127
fi



if [ ! -f build-common.sh ]; then
    echo "File Error: build-common.sh is missing!"
    exit 255
fi

if [ ! -f build-chromium.sh ]; then
    echo "File Error: build-chromium.sh is missing!"
    exit 255
fi

if [ ! -f build-firefox.sh ]; then
    echo "File Error: build-firefox.sh is missing!"
    exit 255
fi


build() {
    ./build-common.sh
    return=$?
    if [ $return -eq 2 ]; then
        echo "User quit application"
        exit 2
    elif [ $return -gt 0 ]; then
        echo $return
        echo "Error: build-common.sh failed!"
        exit $return
    fi
    return $return
}


case $1 in
    "-C" | "common")
    build
    exit $?
    ;;

    "-c" | "chromium" | "Chromium")
    build
    ./build-chromium.sh
    exit $?
    ;;

    "-f" | "firefox" | "Firefox" | "FireFox")
    build
    ./build-firefox.sh
    exit $?
    ;;

    "-a" | "--all" | "all")
    build
    ./build-chromium.sh
    ./build-firefox.sh
    exit $?
    ;;

    *)
    echo "Deslopify build script"
    echo "Usage:"
    echo "[-C, common] - build raw Deslopify"
    echo "[-c, chromium] - build Deslopify for Chromium"
    echo "[-f, firefox] - build Deslopify for Firefox"
    echo "[-a, --all, all - build Deslopify for both Chromium and Firefox"
    exit 0
    ;;
esac
