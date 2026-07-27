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

// For google.com

const hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

//if (domain)
//throw new Error("Not Google.")

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
        const children: HTMLElement[] = Array.from(e.children);
        let questions: HTMLElement[] = [];

        // Children include both <div>s (we want) and <style>s (don't want).
        for (const child of children) {
            if (child.tagName === "DIV") {
                questions.push(child);
            }
        }

        for (const question of questions) {
            if (question.getAttribute("data-noai") !== "true") {
                question.style.display = "none";
            }
        }
    }
}

((): void => {
    const observer = new MutationObserver(() => {
        removePeopleAlsoAsk();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
