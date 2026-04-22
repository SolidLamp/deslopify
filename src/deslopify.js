let hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

let blockedClasses;
let blockedIDs;
let blockedOtherIdentifiers;
let blockedTextContent;

/**
 *Blocks elements.
 *
 * @param {string[]} blockedClasses
 * @param {string[]} blockedIDs
 * @param {string[]} blockedOtherIdentifiers
 * @param {string[]} blockedTextContent
 */
function blockElements(
    blockedClasses,
    blockedIDs,
    blockedOtherIdentifiers,
    blockedTextContent,
) {
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

    // Detect elements by text content
    const textTags = ["a", "p", "span", "div", "button"]
    const textElements = Array.from(document.querySelectorAll(textTags));
    const blockedTextElements = textElements.filter((element) =>
        blockedTextContent.includes(element.textContent.trim()),
    );
    elements = elements.concat(blockedTextElements);

    
    console.log(elements.length.toString() + " elements detected.");
    let len = elements.length;

    for (let i = 0; i < len; ++i) {
        elements[i].style.display = "none";
    }

    console.log("Deslopify: Deleted " + len.toString() + " elements.");

    const response = browser.runtime.sendMessage(len);
}

// We need this loop if the user adds the extension while already on a page.
noConnection = true;
let message;
while (noConnection) {
    try {
        message = browser.runtime.sendMessage({
            message: "getBlocklist",
            data: domain,
        });
        noConnection = false;
    } catch (e) {
        noConnection = true;
    }
}

message.then((value) => {
    // console.log(value.message);
    let blocklist = value.message;
    blockedClasses = blocklist.classes;
    blockedIDs = blocklist.IDs;
    blockedOtherIdentifiers = blocklist.otherIdentifiers;
    blockedTextContent = blocklist.textContent;
    blockElements(
        blockedClasses,
        blockedIDs,
        blockedOtherIdentifiers,
        blockedTextContent,
    );
});

const observer = new MutationObserver(() => {
    blockElements(
        blockedClasses,
        blockedIDs,
        blockedOtherIdentifiers,
        blockedTextContent,
    );
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
