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

export {}

const api = typeof browser !== "undefined" ? browser : chrome;

interface Blocklist {
    classes: string[];
    IDs: string[];
    otherIdentifiers: string[];
    textContent: string[];
}

console.log(
    "Deslopify is provided under the GNU Affero General Public License version 3. This extension is provided without warranty. Please see http://www.gnu.org/licenses/ for more details. Source code can be found at https://github.com/solidlamp/deslopify.",
);

let hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

/**
 * Adds an array of Elements to an array of HTMLElements, with checks.
 *
 * @param elementsForRemoval - the array of HTMLElements for removal to add to.
 * @param elementsToAdd - the array of Elements to add if they are HTMLElements.
 */
function addElements(
    elementsForRemoval: HTMLElement[],
    elementsToAdd: Element[],
): void {
    for (let element of elementsToAdd) {
        if (element instanceof HTMLElement) {
            elementsForRemoval.push(element);
        }
    }
}

/**
 * Deletes elements in the DOM based on their identifiers.
 *
 * @param blockedClasses - the names of classes to remove from the DOM.
 * @param blockedIDs - the names of IDs to remove from the DOM.
 * @param blockedOtherIdentifiers - CSS other identifiers to remove from DOM.
 * @param blockedTextContent - the names of classes to remove from the DOM.
 */
function blockElements(
    blockedClasses: string[],
    blockedIDs: string[],
    blockedOtherIdentifiers: string[],
    blockedTextContent: string[],
): void {
    let elements: HTMLElement[] = [];

    // Detect elements by class
    for (let i = 0; i < blockedClasses.length; ++i) {
        let newElements = document.getElementsByClassName(blockedClasses[i]);
        if (newElements) {
            let newElementArray: Element[] = Array.from(newElements);
            addElements(elements, newElementArray);
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
            let newElementArray: Element[] = Array.from(newElements);
            addElements(elements, newElementArray);
        }
    }

    // Detect elements by text content
    const textTags = "a, p, span, div, button";
    const textElements = Array.from(document.querySelectorAll(textTags));
    const blockedTextElements = textElements.filter((element) =>
        blockedTextContent.includes(element.textContent.trim()),
    );
    addElements(elements, blockedTextElements);

    console.log(`Deslopify: ${elements.length.toString()} elements detected.`);
    let len: number = elements.length;

    for (let i = 0; i < len; ++i) {
        elements[i].style.display = "none";
    }

    console.log("Deslopify: Deleted " + len.toString() + " elements.");

    const response = api.runtime.sendMessage(len);
}

/**
 * Calls blockElements with a packed blocklist.
 *
 * @param blocklist - The blocklist to unpack
 */
function unpackBlocklist(blocklist: Blocklist): void {
    let blockedClasses =
        typeof blocklist.classes !== "undefined" ? blocklist.classes : [];
    let blockedIDs =
        typeof blocklist.IDs !== "undefined" ? blocklist.IDs : [];
    let blockedOtherIdentifiers =
        typeof blocklist.otherIdentifiers !== "undefined" ? blocklist.otherIdentifiers : [];
    let blockedTextContent =
        typeof blocklist.textContent !== "undefined" ? blocklist.textContent : [];
    blockElements(
        blockedClasses,
        blockedIDs,
        blockedOtherIdentifiers,
        blockedTextContent,
    );
}

// We need this loop if the user adds the extension while already on a page.
let noConnection: boolean = true;
let message: { message: string | Blocklist } = { message: "Connection error." };
while (noConnection) {
    try {
        message = await api.runtime.sendMessage({
            message: "getBlocklist",
            data: domain,
        });
        noConnection = false;
    } catch (e) {
        noConnection = true;
    }
}

let blocklist: Blocklist;
if (typeof message.message === "object") {
    blocklist = message.message;
} else {
    blocklist = {
        classes: [],
        IDs: [],
        otherIdentifiers: [],
        textContent: [],
    };
}

unpackBlocklist(blocklist);

const observer = new MutationObserver(() => {
    unpackBlocklist(blocklist);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
