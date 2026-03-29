const blockedIDs = [
    "askmiso-ask-query_1-0",
    "AIOverlay",
    "mosaic-provider-career-guide-scout-promo",
];

const blockedClasses = ["ai-header-button", "assistantIcon"];

let elements = [];
for (let i = 0; i < blockedClasses.length; ++i) {
    let newElements = document.getElementsByClassName(blockedClasses[i]);
    if (newElements) {
        let newElementArray = Array.from(newElements);
        elements = elements.concat(newElementArray);
    }
}

console.log("Deslopify: " + elements.length.toString() + " elements detected.");

for (let i = 0; i < blockedIDs.length; ++i) {
    let newElement = document.getElementById(blockedIDs[i]);
    if (newElement) {
        elements[elements.length] = newElement;
    }
}

console.log("Deslopify: " + elements.length.toString() + " elements detected.");
let len = elements.length;

for (let i = 0; i < len; ++i) {
    elements[i].style.display = "none";
    console.log("Deslopify: deleted element.");
}

console.log("Deslopify: deleted " + len.toString() + " elements.");

/**
 * TODO: Create background script and set up counter of blocked elements
 * browser.action.setBadgeText({text: len.toString()});
 */
