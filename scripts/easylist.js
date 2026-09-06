#!/usr/bin/node

import fs from 'fs';

if (process.argv[2] === undefined) {
    throw new Error("Supply blocklist as argument.");
}

const blocklistFile = process.argv[2];
let blocklist = {};

fs.readFile(blocklistFile, stuffHere);

function simpleHandler(domain, classesData, identifier, endString) {
    identifier = (typeof identifier !== "string") ? "." : identifier;
    endString = (typeof endString !== "string") ? "" : endString;
    for (const cssClass of classesData) {
        console.log(`${domain}##${identifier}${cssClass}${endString}`)
    }
}

function stuffHere(err, data) {
    if (err) throw err; 
    blocklist = JSON.parse(data); 
    let count = 0;
    
    console.log("! Title: Deslopify blocklist in EasyList format");
    console.log("! Homepage: https://github.com/SolidLamp/deslopify");
    console.log("\n\n")

    for (let [key, value] of Object.entries(blocklist)) {
        if (key === "$schema") continue;
        if (key === "format_version") continue;

        if (typeof value !== "object") {
            value = blocklist[value];
        }
        
        count++;
        console.log(`! ${"=".repeat(key.length + 6)}`);
        console.log(`! == ${key} ==`);
        console.log(`! ${"=".repeat(key.length + 6)}`);
        simpleHandler(key, value.classes, ".");
        simpleHandler(key, value.IDs, "#");
        simpleHandler(key, value.otherIdentifiers, "");
        simpleHandler(key, value.textContent, "*:hasText(", ")");
        console.log("\n");
    }

    console.log(`! Total keys: ${count}`);
}


