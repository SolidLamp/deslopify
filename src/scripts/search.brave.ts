/*  Deslopify site-specific script: Warnings for AI websites on Brave Search
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

// For search.brave.com

const hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

if (domain.substring(0, 12) != "search.brave") {
    throw new Error("Not Brave Search.");
}

function markAsAIWrapper(observer: MutationObserver): void {
    const allResults = document.getElementsByClassName("svelte-14r20fy l1");
    const aiWarnings = document.getElementsByClassName("deslopify-ai-warning");
    if (Array.from(allResults).length === Array.from(aiWarnings).length) {
        observer.disconnect();
        return;
    }
    markAsAI("svelte-14r20fy l1", 4);
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

((): void => {
    setTimeout(markAsAI, 1000, "svelte-14r20fy l1", 4);
    const observer = new MutationObserver(() => {
        markAsAIWrapper(observer);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
