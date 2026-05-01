const api = typeof browser !== "undefined" ? browser : chrome;

const blocklistURL = api.runtime.getURL("blocklist.json");
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
    }
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
