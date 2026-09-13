/*  Deslopify site-specific script: Warnings for AI websites on Yandex
    Copyright (C) 2026 SolidLamp

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */

export {};

import blocklist from "../blocklist.json" with { type: "json" };
import warninglist from "../warninglist.json" with { type: "json" };
import { markAsAI } from "./.search.common.ts";

const api = typeof browser !== "undefined" ? browser : chrome;

// For yandex.com

const hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

if (domain.substring(0, 6) != "yandex") {
    throw new Error("Not Yandex.");
}

// We need this loop if the user adds the extension while already on a page.
let noConnection: boolean = true;
let message: { message: string | boolean } = { message: "Connection error." };
while (noConnection) {
    try {
        message = await api.runtime.sendMessage({
            message: "getActive",
            data: domain,
        });
        noConnection = false;
    } catch {
        noConnection = true;
    }
}

let active: boolean = false;
if (typeof message.message === "boolean") {
    active = message.message;
}

if (!active) {
    throw new Error("Inactive.");
}

(async (): Promise<void> => {
    let url: string = location.href;
    let timeoutScript: number;

    const observer = new MutationObserver(() => {
        clearTimeout(timeoutScript);

        timeoutScript = setTimeout(async (): Promise<void> => {
            if (location.href === url) return;
            console.log("urls different");
            
            url = location.href;
            await markAsAI("OrganicTitle-Link", 3);
        }, 500);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    setTimeout(markAsAI, 1500, "OrganicTitle-Link", 3);
})();
