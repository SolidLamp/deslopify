#!/usr/bin/env node

/* This script is naive and only supports IDs and classes */
/* Requires Node 20 */

import fs from "fs";

function mergeObject(blocklist, append) {
    if (Array.isArray(blocklist) && Array.isArray(append)) {
        return blocklist.concat(append);
    }
    if (!blocklist || !append)
        throw new TypeError(`??? not valid ${blocklist}, ${append}`);
    if (
        !(
            Object.getPrototypeOf(blocklist) === Object.prototype &&
            Object.getPrototypeOf(append) === Object.prototype
        )
    ) {
        throw new TypeError("This is not a plain object. >:(");
    }
    let newObject = blocklist;
    for (const key of Object.keys(append)) {
        if (key in blocklist) {
            newObject[key] = mergeObject(blocklist[key], append[key]);
        } else {
            newObject[key] = append[key];
        }
    }
    return newObject;
}

function isValidURL(url) {
    url = url.startsWith("https://") ? url.slice(8) : url;
    url = url.startsWith("http://") ? url.slice(7) : url;
    url = `http://{url}`;
    try {
        const tryurl = new URL(url);
    } catch (e) {
        return false;
    }
    return true;
}

function getRuleType(rule) {
    // TODO: better loop
    if (rule[0] === "#") return "id";
    if (rule[0] === ".") return "class";
    if (rule.slice()[0] === ".") return "class";
    return "other";
}

function processLine(line, ignoreErrors) {
    const defaultBlocklist = {
        classes: [],
        IDs: [],
        otherIdentifiers: [],
        textContent: [],
    };

    const rulesTable = {
        class: "classes",
        id: "IDs",
    };

    // get rid of everything commented bc we don't care about them
    const string = line.trim().split("!")[0];
    if (!string) return {};

    // get the url by split at selector
    // TODO: May be multiple websites
    const url = string.trim().split("##")[0];
    if (!url && !ignoreErrors) throw new Error("Why is there only selector?");
    if (!url && ignoreErrors) return {};

    if (!isValidURL(url) && !ignoreErrors)
        throw new Error(`Invalid URL: ${url}`);
    if (!isValidURL(url) && ignoreErrors) return {};

    const subObject = getRuleType(string.trim().split("##")[1]);

    let returnObject = { [url]: defaultBlocklist };

    if (Object.hasOwn(rulesTable, subObject)) {
        const classes = string.trim().split("##")[1].split("#");
        const classes2 = classes[classes.length - 1].split(".");
        const rule = classes2[classes2.length - 1];
        returnObject[url][rulesTable[subObject]] = [rule];
    }

    return returnObject;
}

export default function main(easylist) {
    if (easylist === undefined) {
        throw new Error("Supply blocklist as argument.");
    }
    const lines = easylist.split(/(?:\n|\r\n?)/);
    let blocklist = {};
    // console.log(mergeObject(easylist, more));
    for (const line of lines) {
        const object = processLine(line, false);
        blocklist = mergeObject(blocklist, object);
    }
    console.log(blocklist);
    // const blocklist = {}
}

async function argMain() {
    if (process.argv[2] === undefined) {
        throw new Error("Supply blocklist as argument.");
    }

    let blocklist = {};
    const blocklistFile = process.argv[2];

    await fs.readFile(blocklistFile, "utf-8", (err, data) => {
        if (err) throw err;
        main(data);
    });
}

async function stdinMain() {
    let blocklist = fs.readFileSync(process.stdin.fd, "utf-8");
    main(blocklist);
}

if (process.argv[1] === import.meta.filename) {
    if (process.stdin.isTTY) {
        argMain();
    } else {
        stdinMain();
    }
}
