let fullURL = browser.runtime.getURL("blocklist.json");
console.log(fullURL);

/**
 * A list of components to block on a given webpage.
 * @typedef {Object} Blocklist
 * @property {string[]} classes
 * @property {string[]} ids
 * @property {string[]} otherIdentifiers
 */

const blockedClasses = [
    "ai-header-button", // "*://dictionary.cambridge.org/*"
    "assistantIcon", // "*://*.collinsdictionary.com/*"
    "react-module", // "*://duckduckgo.com/*"
    "fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full", // "*://plughopper.com/*"
    "fixed bottom-20 right-4", // "*://plughopper.com/*"
];

const blockedIDs = [
    "askmiso-ask-query_1-0", // "*://*.investopedia.com/*"
    "AIOverlay", // "*://*.oed.com/*"
    "mosaic-provider-career-guide-scout-promo", // "*://*.indeed.com/*"
    "m-x-content", // "*://www.google.com/*"
    // "rcnt", // "*://www.google.com/*"
];

const blockedOtherIdentifiers = [
    "[data-testid='ai-toggle']", // "*://duckduckgo.com/*"
    "[data-testid='aichat-button']", // "*://duckduckgo.com/*"
    "[onclick='window.assistantTracker?.eventBurgerMenuItemClick()']", // "*://dictionary.cambridge.org/*"
    "[data-mstk-u='']", // "*://www.google.com/*"
    "[data-fh='']", // "*://www.google.com/*"
];

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
        browser.action.setBadgeText({ text: message, tabId: tabID });
        browser.action.setBadgeBackgroundColor({ color: "grey" });
        sendResponse({ message: "Succesfully updated." });
    }
}

/**
 *Gets the blocklist
 *
 * @returns {Blocklist}
 */
function getBlocklist() {
    const blocklist = {
        classes: blockedClasses,
        ids: blockedIDs,
        otherIdentifiers: blockedOtherIdentifiers,
    };
    return blocklist;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabID = sender.tab.id;
    if (typeof message == "number") {
        updateBadgeCounter(message, tabID, sendResponse);
    } else if (message == "getBlocklist") {
        const blocklist = getBlocklist();
        sendResponse({ message: blocklist });
    } else {
        sendResponse({ message: "Failed to parse message." });
    }
});

/* browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    try {
        await browser.scripting.executeScript({
            target: {
                tabId: tabId,
            },
            files: ["borderify.js"],
        });
        console.log("Successfully injected content script!");
    } catch (e) {
        console.error(`failed to execute script: ${e}`);
    }
    // const sending = browser.tabs.sendMessage(tabId, "Run");
});

browser.action.onClicked.addListener(async (tab) => {
    try {
        await browser.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            files: ["borderify.js"],
        });
        console.log("Successfully injected content script!");
    } catch (e) {
        console.error(`failed to execute script: ${e}`);
    }
    // const sending = browser.tabs.sendMessage(tabId, "Run");
}); */
