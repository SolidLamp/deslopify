const website = window.location.hostname;
const parts = website.split(".");
const apexName = parts.slice(1).join(".");

const blockedClasses = [
    "ai-header-button", // "*://dictionary.cambridge.org/*"
    "assistantIcon", // "*://*.collinsdictionary.com/*"
    "react-module", // "*://duckduckgo.com/*"
    "fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full", // "*://plughopper.com/*"
    "flex-1 overflow-y-auto px-4 py-4 space-y-3", // "*://plughopper.com/*"
];

const blockedIDs = [
    "askmiso-ask-query_1-0", // "*://*.investopedia.com/*"
    "AIOverlay", // "*://*.oed.com/*"
    "mosaic-provider-career-guide-scout-promo", // "*://*.indeed.com/*"
    "m-x-content", // "*://www.google.com/*"
    // "rcnt", // "*://www.google.com/*"
];

const blockedDataTestIDs = [
    "ai-toggle", // "*://duckduckgo.com/*"
    "aichat-button", // "*://duckduckgo.com/*"
];

function main(...args) {
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

    // Detect elements by data-testid
    for (let i = 0; i < blockedDataTestIDs.length; ++i) {
        let newElements = document.querySelectorAll(
            "[data-testid='" + blockedDataTestIDs[i] + "']",
        );
        if (newElements) {
            let newElementArray = Array.from(newElements);
            elements = elements.concat(newElementArray);
        }
    }

    console.log(
        "Deslopify: " + elements.length.toString() + " elements detected.",
    );
    let len = elements.length;

    for (let i = 0; i < len; ++i) {
        elements[i].style.display = "none";
        console.log("Deslopify: deleted element.");
    }

    console.log("Deslopify: deleted " + len.toString() + " elements.");

    const sending = browser.runtime.sendMessage(len.toString());
    console.log(sending);
}

main();

/*
// browser.tabs.onUpdated.addListener(main);
*/

// Repeat the blocking multiple times for slow websites
// TODO: Create a better solution
setTimeout(main, 100);
setTimeout(main, 300);
setTimeout(main, 500);
setTimeout(main, 1000);
