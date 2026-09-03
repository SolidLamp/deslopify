/*  Deslopify site-specific script: Warnings for AI websites on Startpage
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

const api = typeof browser !== "undefined" ? browser : chrome;

// For startpage.com

const aiWebsites: Set<string> = Array.isArray(warninglist.ai)
    ? new Set(warninglist.ai)
    : new Set();
const proaiWebsites: Set<string> = Array.isArray(warninglist.proai)
    ? new Set(warninglist.proai)
    : new Set();
const antiaiWebsites: Set<string> = Array.isArray(warninglist.antiai)
    ? new Set(warninglist.antiai)
    : new Set();

const hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

if (domain.substring(0, 9) != "startpage") {
    throw new Error("Not StartPage.");
}

async function markAsAI(): Promise<void> {
    const allResults = document.getElementsByClassName("result-title result-link");
    for (const e of allResults) {
        const href: string | null = e.getAttribute("href");
        let url: string = "none";
        try {
            url = href ? new URL(href).hostname : "none";
        } catch (TypeError) {
            url = "none";
        }

        if (url === "none") {
            continue;
        }

        let parent: HTMLElement | null = e.parentElement;
        if (!parent) {
            console.log("Deslopify: Parent missing?");
            return;
        }

        // This again
        if (url.substring(0, 4) == "www.") {
            url = url.slice(4);
        }

        // Now we do the visual stuff
        const aiWarning = document.createElement("span");
        aiWarning.style =
            "transform: skew(-0.25rad); border-radius: 5px; background-color: #ff8c42; padding: 2px 12px; display: inline flow-root; color: #fef5ec; font: normal normal 500 16px 'Source Sans 3', sans-serif;";
        
        if (aiWebsites.has(url)) {
            aiWarning.textContent = "AI";
            aiWarning.style.setProperty("background-color", "#93032E");
        } else if (url in blocklist) {
            aiWarning.textContent = "Website contains Generative AI Elements";
            aiWarning.style.setProperty("background-color", "#ff8c42");
        } else if (proaiWebsites.has(url)) {
            aiWarning.textContent = "Pro-AI";
            aiWarning.style.setProperty("background-color", "#473198");
        } else if (antiaiWebsites.has(url)) {
            aiWarning.textContent = "Anti-AI";
            aiWarning.style.setProperty("background-color", "#60A561");
        } else {
            aiWarning.style.display = "none";
        }

        parent.appendChild(aiWarning);
    }
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
    await markAsAI();
})();
