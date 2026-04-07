let hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

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

function main() {
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

    console.log(elements.length.toString() + " elements detected.");
    let len = elements.length;

    for (let i = 0; i < len; ++i) {
        elements[i].style.display = "none";
        console.log("Deslopify: Deleted element.");
    }

    console.log("Deslopify: Deleted " + len.toString() + " elements.");

    const response = browser.runtime.sendMessage(len);
}

main();

const observer = new MutationObserver(() => {
    main();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
