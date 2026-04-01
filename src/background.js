let fullURL = browser.runtime.getURL("blockedIDs.json");
console.log(fullURL);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabID = sender.tab.id;
    if (message == "0") {
        sendResponse({ message: "Did not update." });
    } else {
        browser.action.setBadgeText({ text: message, tabId: tabID });
        browser.action.setBadgeBackgroundColor({ color: "grey" });
        sendResponse({ message: "Succesfully updated." });
    }
});
