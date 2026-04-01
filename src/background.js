let fullURL = browser.runtime.getURL("blockedIDs.json");
console.log(fullURL);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabID = sender.tab.id;
    console.log("Received message!");
    if (message == "0") {
        sendResponse({ message: "Did not update." });
    } else {
        browser.action.setBadgeText({ text: message, tabId: tabID });
        browser.action.setBadgeBackgroundColor({ color: "grey" });
        sendResponse({ message: "Succesfully updated." });
    }
    return true;
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
