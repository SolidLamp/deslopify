/*  Deslopify content script: hides 'in-your-face AI' elements on websites.
    Copyright (C) 2026 SolidLamp

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */

const api = typeof browser !== "undefined" ? browser : chrome;

console.log(
    "Deslopify is provided under the GNU Affero General Public License version 3. This extension is provided without warranty. Please see http://www.gnu.org/licenses/ for more details.",
);

let hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

let blockedClasses;
let blockedIDs;
let blockedOtherIdentifiers;
let blockedTextContent;

/**
 *Blocks elements.
 *
 * @param {string[]} blockedClasses
 * @param {string[]} blockedIDs
 * @param {string[]} blockedOtherIdentifiers
 * @param {string[]} blockedTextContent
 */
function blockElements(
    blockedClasses,
    blockedIDs,
    blockedOtherIdentifiers,
    blockedTextContent,
) {
    let elements = [];

    // Detect elements by class
    for (let i = 0; i < blockedClasses.length; ++i) {
        let newElements = document.getElementsByClassName(blockedClasses[i]);
        if (newElements) {
            let newElementArray = Array.from(newElements);
            elements = elements.concat(newElementArray);
        }
    }

    // Detect elements by id
    for (let i = 0; i < blockedIDs.length; ++i) {
        let newElement = document.getElementById(blockedIDs[i]);
        if (newElement) {
            elements[elements.length] = newElement;
        }
    }

    // Detect elements by other identifiers
    for (let i = 0; i < blockedOtherIdentifiers.length; ++i) {
        let newElements = document.querySelectorAll(blockedOtherIdentifiers[i]);
        if (newElements) {
            let newElementArray = Array.from(newElements);
            elements = elements.concat(newElementArray);
        }
    }

    // Detect elements by text content
    const textTags = ["a", "p", "span", "div", "button"];
    const textElements = Array.from(document.querySelectorAll(textTags));
    const blockedTextElements = textElements.filter((element) =>
        blockedTextContent.includes(element.textContent.trim()),
    );
    elements = elements.concat(blockedTextElements);

    console.log(elements.length.toString() + " elements detected.");
    let len = elements.length;

    for (let i = 0; i < len; ++i) {
        elements[i].style.display = "none";
    }

    console.log("Deslopify: Deleted " + len.toString() + " elements.");

    const response = api.runtime.sendMessage(len);
}

// We need this loop if the user adds the extension while already on a page.
let noConnection = true;
let message;
while (noConnection) {
    try {
        message = api.runtime.sendMessage({
            message: "getBlocklist",
            data: domain,
        });
        noConnection = false;
    } catch (e) {
        noConnection = true;
    }
}

message.then((value) => {
    // console.log(value.message);
    let blocklist = value.message;
    blockedClasses = blocklist.classes;
    blockedIDs = blocklist.IDs;
    blockedOtherIdentifiers = blocklist.otherIdentifiers;
    blockedTextContent = blocklist.textContent;
    blockElements(
        blockedClasses,
        blockedIDs,
        blockedOtherIdentifiers,
        blockedTextContent,
    );
});

const observer = new MutationObserver(() => {
    blockElements(
        blockedClasses,
        blockedIDs,
        blockedOtherIdentifiers,
        blockedTextContent,
    );
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
