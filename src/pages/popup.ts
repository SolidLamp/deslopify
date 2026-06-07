const api = typeof browser !== "undefined" ? browser : chrome;

/* function to check if website already there and update text */

interface StorageArea {
    get: (keys?: string | string[]) => Promise<object>;
    set: (items: Record<string, unknown>) => Promise<void>;
}

async function getCurrentTab(): Promise<{
    currentWebpage: object;
    activeWebsite: string;
}> {
    // Get the current tab.
    const activeTabs: object[] = await api.tabs.query({
        active: true,
        currentWindow: true,
    });
    const currentWebpage: object = activeTabs[0];

    // Get url of current tab
    let activeWebsite: string = "";
    if ("url" in currentWebpage) {
        activeWebsite = new URL(currentWebpage.url).hostname;
    }
    if (activeWebsite.substring(0, 4) == "www.") {
        activeWebsite = activeWebsite.slice(4);
    }
    const returnValue = {
        currentWebpage: currentWebpage,
        activeWebsite: activeWebsite,
    };
    return returnValue;
}

async function getStoredArray(
    id: string,
    storageArea: StorageArea,
): Promise<string[]> {
    let storageArray: string[] = [];
    let storage: object | string[] = await storageArea.get(id);

    if (typeof storage === "object" && Object.hasOwn(storage, id)) {
        storageArray = storage[id];
    } else if (typeof storage === "object" && storage.constructor === Array) {
        storageArray = storage;
    }
    return storageArray;
}

function storeOnPress(id: string, storageArea: StorageArea): void {
    const element: HTMLElement | null = document.getElementById(id);

    if (element === null) {
        throw new Error(`Element ${id} does not exist!`);
    }

    element.addEventListener("click", async () => {
        // Get current tab
        const currentTab = await getCurrentTab();
        const activeWebsite = currentTab.activeWebsite;
        const currentWebpage = currentTab.currentWebpage;

        // Get the current array from memory
        const storageArray = await getStoredArray(id, storageArea);

        // Modify array
        console.log(storageArray);
        const index = storageArray.indexOf(activeWebsite);
        if (index > -1) {
            storageArray.splice(index, 1);
            console.log(`Removed website ${activeWebsite}`);
        } else {
            storageArray[storageArray.length] = activeWebsite;
            console.log(`Added website ${activeWebsite}`);
        }

        // Write array to memory
        storageArea.set({ [id]: storageArray }).then(
            () => {
                console.log("Stored!");
            },
            (error: any) => {
                console.error(error);
                return;
            },
        );

        // Update popup to reflect changes
        updateDOM();

        // Reload tab
        const tabid: number = currentWebpage.id;
        api.tabs.reload(tabid);
    });
}

function openLinkOnPress(id: string, link: string): void {
    const element: HTMLElement | null = document.getElementById(id);

    if (element === null) {
        throw new Error(`Element ${id} does not exist!`);
    }

    element.addEventListener("click", () => {
        api.tabs.create({ active: true, url: link });
        close();
    });
}

async function updateDOM(): Promise<void> {
    console.log("I am here!");

    const currentTab = await getCurrentTab();
    const activeWebsite = currentTab.activeWebsite;

    const blocklistURL = api.runtime.getURL("assets/blocklist.json");
    const response = await fetch(blocklistURL);
    const blocklistObject: object = await response.json();
    const supported: boolean = activeWebsite in blocklistObject;
    let active: boolean = activeWebsite in blocklistObject;

    const localArray = await getStoredArray(
        "button-perm-allow",
        api.storage.local,
    );
    const sessionArray = await getStoredArray(
        "button-temp-allow",
        api.storage.session,
    );

    console.log(localArray);
    console.log(sessionArray);

    if (
        localArray.includes(activeWebsite) ||
        sessionArray.includes(activeWebsite)
    ) {
        active = false;
    }

    const body = document.getElementsByTagName("body")[0];
    const activeUI = document.getElementById("active");
    const inactiveUI = document.getElementById("inactive");
    const tempAllow = document.getElementById("button-temp-allow");
    const permAllow = document.getElementById("button-perm-allow");
    const tempAllowText = document.getElementById("temp-allow-text");
    const permAllowText = document.getElementById("perm-allow-text");
    const urlDisplay = document.getElementById("current-webpage-url");

    // Need to assert that all exist
    if (!body) throw new Error("THE BODY IS MISSING!!!");
    if (!activeUI) throw new Error("#active missing");
    if (!inactiveUI) throw new Error("#inactive missing");
    if (!tempAllow) throw new Error("#button-temp-allow missing");
    if (!permAllow) throw new Error("#button-perm-allow missing");
    if (!tempAllowText) throw new Error("#temp-allow-text missing");
    if (!permAllowText) throw new Error("#perm-allow-text missing");
    if (!urlDisplay) throw new Error("#current-webpage-url missing");

    // Here we do the modification
    if (active) {
        body.classList.add("active-background");
        body.classList.remove("inactive-background");
        activeUI.style.display = "block";
        inactiveUI.style.display = "none";
    } else {
        body.classList.add("inactive-background");
        body.classList.remove("active-background");
        activeUI.style.display = "none";
        inactiveUI.style.display = "block";
    }

    // Check for buttons
    if (localArray.includes(activeWebsite)) {
        permAllowText.textContent = "Enable blocking on this website permanently";
    } else {
        permAllowText.textContent = "Disable blocking on this website permanently";
    }
    if (sessionArray.includes(activeWebsite)) {
        tempAllowText.textContent =
            "Enable blocking on this website for this session";
    } else {
        tempAllowText.textContent =
            "Disable blocking on this website for this session";
    }

    // Unsupported websites
    if (!supported) {
        const buttons: HTMLElement[] = Array.from(
            document.getElementsByClassName("supported"),
        );
        for (const element of buttons) {
            element.style.display = "none";
        }
        activeUI.textContent = "Unsupported Website";
        inactiveUI.textContent = "Unsupported Website";
    }

    // Update URL
    urlDisplay.textContent = activeWebsite;
}

storeOnPress("button-temp-allow", api.storage.session);
storeOnPress("button-perm-allow", api.storage.local);
openLinkOnPress(
    "report-website",
    "https://github.com/SolidLamp/deslopify/issues/new?template=website-support-request.md",
);
openLinkOnPress(
    "report-bug",
    "https://github.com/SolidLamp/deslopify/issues/new?template=bug-report.md",
);
updateDOM();
