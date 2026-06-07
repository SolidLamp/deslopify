const api = typeof browser !== "undefined" ? browser : chrome;

/* function to check if website already there and update text */

interface StorageArea {
    get: (keys?: string | string[]) => Promise<object>;
    set: (items: Record<string, unknown>) => Promise<void>;
}

function storeOnPress(id: string, storageArea: StorageArea): void {
    const element: HTMLElement | null = document.getElementById(id);

    if (element != null) {
        element.addEventListener("click", async () => {
            // Get the current array from memory
            let storageArray: string[] = [];
            let storage: object | string[] = await storageArea.get(id);

            if (typeof storage === "object" && Object.hasOwn(storage, id)) {
                storageArray = storage[id];
            } else if (
                typeof storage === "object" &&
                storage.constructor === Array
            ) {
                storageArray = storage;
            }

            // Get the current tab.
            const activeTabs: object[] = await api.tabs.query({
                active: true,
                currentWindow: true,
            });
            const currentWebpage: object = activeTabs[0];

            /*.then(
                    (value: object[]) => {
                        currentWebpage = value[0];
                    },
                    (error: any) => {
                        console.error(error);
                        return;
                    },
                ); */

            // Get url of current tab
            let activeWebsite: string = "";
            if ("url" in currentWebpage) {
                activeWebsite = new URL(currentWebpage.url).hostname;
            }
            if (activeWebsite.substring(0, 4) == "www.") {
                activeWebsite = activeWebsite.slice(4);
            }

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

            // Reload tab
            const tabid: number = currentWebpage.id;
            api.tabs.reload(tabid);

        });
    }
}

storeOnPress("button-temp-allow", api.storage.session);
storeOnPress("button-perm-allow", api.storage.local);
