/*  Deslopify background script: hides 'in-your-face AI' elements on websites.
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

const blocklistURL = api.runtime.getURL("assets/blocklist.json");
const response = await fetch(blocklistURL);
const blocklistObject = await response.json();
console.log(blocklistObject);

/**
 * A list of components to block on a given webpage.
 * @typedef {Object} Blocklist
 * @property {string[]} classes
 * @property {string[]} ids
 * @property {string[]} otherIdentifiers
 */

/**
 *Updates the count as displayed on the badge next to the extension icon.
 *
 * @param {number} count
 * @param {number} tabID
 * @param {Function} sendResponse
 */
function updateBadgeCounter(count, tabID, sendResponse) {
    let message = count.toString();
    console.log("Received message!");
    if (message == "0") {
        sendResponse({ message: "Did not update." });
    } else {
        api.action.setBadgeText({ text: message, tabId: tabID });
        api.action.setBadgeBackgroundColor({ color: "grey" });
        sendResponse({ message: "Succesfully updated." });
    }
}

/**
 *Gets the blocklist
 *
 * @param {string} domain
 * @returns {Blocklist}
 */
function getBlocklist(domain) {
    const defaultBlocklist = {
        classes: [],
        IDs: [],
        otherIdentifiers: [],
    };
    if (typeof domain != "string") {
        console.warn("Deslopify: Invalid domain");
        return defaultBlocklist;
    }
    if (domain in blocklistObject) {
        let blocklist = blocklistObject[domain];
        console.log(`Deslopify: Domain found: ${domain}!`);
        console.log(blocklist);
        return blocklist;
    } else {
        console.log(`Deslopify: Domain has no data: ${domain}`);
        return defaultBlocklist;
    }
}

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabID = sender.tab.id;
    if (typeof message == "number") {
        updateBadgeCounter(message, tabID, sendResponse);
    } else if (
        typeof message == "object" &&
        "message" in message &&
        "data" in message &&
        message.message == "getBlocklist"
    ) {
        const blocklist = getBlocklist(message.data);
        sendResponse({ message: blocklist });
    } else {
        sendResponse({ message: "Failed to parse message." });
    }
});

/* api.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    try {
        await api.scripting.executeScript({
            target: {
                tabId: tabId,
            },
            files: ["borderify.js"],
        });
        console.log("Successfully injected content script!");
    } catch (e) {
        console.error(`failed to execute script: ${e}`);
    }
    // const sending = api.tabs.sendMessage(tabId, "Run");
});

api.action.onClicked.addListener(async (tab) => {
    try {
        await api.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            files: ["borderify.js"],
        });
        console.log("Successfully injected content script!");
    } catch (e) {
        console.error(`failed to execute script: ${e}`);
    }
    // const sending = api.tabs.sendMessage(tabId, "Run");
}); */
