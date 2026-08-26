/*  Deslopify site-specific script: removes AI on Google Search websites.
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

// Observation: All non-AI 'People Also Ask' popups appear to have the class Sbgr0
// Problem: Blocking a class is easy, but blocking the absence of a class is not
// Solution: add 'noai' to those that are allowed, and remove not having it.

export {};

import blocklist from "../blocklist.json" with { type: "json" };

const api = typeof browser !== "undefined" ? browser : chrome;

// For google.com

const hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

if (domain.substring(0, 6) != "google") {
    throw new Error("Not Google.");
}

/**
 * Deletes 'People Also Ask' questions where an AI overview would be expected.
 */
function removePeopleAlsoAsk(): void {
    // Get elements with Sbgr0, and add 'non-ai: true' to parent elements
    const newElements = document.getElementsByClassName("Sbgr0");
    for (const e of newElements) {
        let parent: Element | null = e;
        try {
            for (let i = 0; i < 6; i++) {
                // There are six parents
                parent = parent.parentElement;
            }
        } catch (TypeError) {
            parent = null;
            console.error("Deslopify: Error finding parent!");
            break;
        }
        if (parent) {
            parent.dataset.noai = "true";
        } else {
            console.error("Deslopify: Error finding parent!");
        }
    }

    // LQCGqc appears to be the class of 'People Also Ask'
    // We want to get all children of LQCGqc, and check for the injected 'noai'
    const peopleAlsoAsk = document.getElementsByClassName("LQCGqc");
    for (const e of peopleAlsoAsk) {
        let hasNoNonAI: boolean = true;
        const children: HTMLElement[] = Array.from(e.children);
        let questions: HTMLElement[] = [];
        let parent: HTMLElement | null = e.parentElement;

        // Children include both <div>s (we want) and <style>s (don't want).
        for (const child of children) {
            if (child.tagName === "DIV") {
                questions.push(child);
            }
        }

        for (const question of questions) {
            if (question.getAttribute("data-noai") !== "true") {
                question.style.display = "none";
            } else {
                hasNoNonAI = false;
            }
        }

        if (hasNoNonAI && parent) {
            parent.style.display = "none";
        }
    }
}

function markAsAI(): void {
    // console.log(blocklist);
    const allResults = document.getElementsByClassName("zReHs");
    for (const e of allResults) {
        /* This approach is not perfect as it has been observed that Google
           Search may return /goto? addresses if not signed in.
           For example, it occurs on my ESR copy of Firefox but not latest
           on the same computer with the same IP.
           So, it likely depends on cookies, or some other tracker.
           However, I spent a fortnight attempting to decode it and gave
           up so I just didn't bother anymore.
           Probably a TODO, but whether it is even possible is another 
           question; it could be non-reversible, e.g. a server-side hash
           table, as the /goto? links have a redirect to the actual page.
           Regardless, assume that doesn't happen.
           Sincerely, me (SolidLamp) */
        const href: string | null = e.getAttribute("href");
        const url: string = href ? new URL(href).hostname : "none";
        if (url in blocklist) {
            let parent: Element | null = e;
            try {
                for (let i = 0; i < 4; i++) {
                    // There are four parents
                    parent = parent.parentElement;
                }
            } catch (TypeError) {
                parent = null;
                console.error("Deslopify: Error finding parent!");
                break;
            }
            if (!parent) {
                console.log("Deslopify: Parent missing?");
            }
            console.log(parent);
            const aiWarning = document.createElement("span");
            aiWarning.textContent = "Deslopify: Website contains AI"
            parent.appendChild(aiWarning);
        }
        
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
    throw new Error("Inactive.")
}

((): void => {

    markAsAI();
    
    const observer = new MutationObserver(() => {
        removePeopleAlsoAsk();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
