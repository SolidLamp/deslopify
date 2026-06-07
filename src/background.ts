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

export {};

import validate from "./validator.cjs";

const api = typeof browser !== "undefined" ? browser : chrome;

interface Blocklist {
    classes: string[];
    IDs: string[];
    otherIdentifiers: string[];
    textContent: string[];
}

interface GeneralBlockList {
    $schema: string;
    format_version: number;
    [key: string]: string | number | Blocklist;
}

interface MessageSender {
    documentId?: string;
    documentLifecycle?: string;
    frameId?: number;
    id?: string;
    origin?: string;
    tab?: object;
    tlsChannelId?: string;
    url?: string;
    userScriptWorldId?: string;
}

console.log(
    "Deslopify is provided under the GNU Affero General Public License version 3. This extension is provided without warranty. Please see http://www.gnu.org/licenses/ for more details. Source code can be found at https://github.com/solidlamp/deslopify.",
);

const blocklistURL = api.runtime.getURL("assets/blocklist.json");
const response = await fetch(blocklistURL);
let blocklistObject: GeneralBlockList = await response.json();
const validBlocklist: boolean = validate(blocklistObject);

console.log(blocklistObject);
console.log(validBlocklist);

if (!validBlocklist) {
    blocklistObject = {
        $schema: "./blocklist.schema.json",
        format_version: 2,
    };
}

/**
 * Updates the count as displayed on the badge next to the extension icon.
 *
 * @param count - The number to overwrite the count on the badge with.
 * @param tabID - the current ID of the tab.
 * @param sendResponse - the function given by onMessage.
 */
function updateBadgeCounter(
    count: number,
    tabID: number,
    sendResponse: (a: object) => void,
): void {
    const message: string = count.toString();
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
 * Gets the blocklist
 *
 * @param domain - the domain of the webpage to check with the full blocklist.
 * @returns the blocklist for the given domain.
 */
async function getBlocklist(domain: string): Promise<Blocklist> {
    const defaultBlocklist: Blocklist = {
        classes: [],
        IDs: [],
        otherIdentifiers: [],
        textContent: [],
    };
    if (typeof domain != "string") {
        console.warn("Deslopify: Invalid domain");
        return defaultBlocklist;
    }
    let blocklist: Blocklist = defaultBlocklist;
    if (domain in blocklistObject) {
        blocklist = blocklistObject[domain];
        console.log(`Deslopify: Domain found: ${domain}!`);
        console.log(blocklist);
    } else {
        console.log(`Deslopify: Domain has no data: ${domain}`);
        return defaultBlocklist;
    }

    const localStorage: object = await api.storage.local.get(null);

    if (
        typeof localStorage === "object" &&
        Object.hasOwn(localStorage, "button-perm-allow") &&
        localStorage["button-perm-allow"].includes(domain)
    ) {
        console.log("Website allowlisted in local storage.");
        return defaultBlocklist;
    }

    const sessionStorage: object = await api.storage.session.get(null);

    if (
        typeof sessionStorage === "object" &&
        Object.hasOwn(sessionStorage, "button-temp-allow") &&
        sessionStorage["button-temp-allow"].includes(domain)
    ) {
        console.log("Website allowlisted in session storage.");
        return defaultBlocklist;
    }

    return blocklist;
}

api.runtime.onMessage.addListener(
    (
        message: object,
        sender: MessageSender,
        sendResponse: (a: object) => void,
    ) => {
        let tabID: number;
        try {
            tabID = sender.tab.id;
        } catch (err) {
            if (err instanceof TypeError) {
                console.log("Error with MessageSender: tab not present.");
                sendResponse({ message: "Error with MessageSender" });
            } else {
                throw err;
            }
        }
        if (typeof message == "number") {
            updateBadgeCounter(message, tabID, sendResponse);
        } else if (
            typeof message == "object" &&
            "message" in message &&
            "data" in message &&
            message.message == "getBlocklist"
        ) {
            getBlocklist(message.data).then((blocklist) => {
                sendResponse({ message: blocklist });
            });
        } else {
            sendResponse({ message: "Failed to parse message." });
        }

        return true;
    },
);

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
