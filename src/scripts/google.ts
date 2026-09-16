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
import warninglist from "../warninglist.json" with { type: "json" };

const api = typeof browser !== "undefined" ? browser : chrome;

// For google.com

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

if (domain.substring(0, 6) != "google") {
    throw new Error("Not Google.");
}

function createPPALink(question: string): string {
    return `
<a href="/search?q=${encodeURIComponent(question)}" style="color: inherit;
text-decoration: none;">
    <div class="wQiwMc related-question-pair" data-q="${question}">
        <div class="roMIYb o3PDvf HYvwY cS7M8 oST1qe g7pt6d h373nd ilulF ysxiae iRPzcb"></div>
        <div style="display: flex; 
        justify-content: space-between;
        align-items: center;
        margin: 4px 2px;
        border-radius: 6px;
        background-color: #4D5156;
        cursor: pointer;
        padding: 12px 20px;">
        <span class="JCzEY tNxQIb CSkcDe">${question}</span>
            <div class="p8Jhnd">
                <span>🔍︎</span>
            </div>
        </div>
    </div>
</a>
    `;
}

function createPeopleAlsoAsk(suggestions: string[]): string {
    let string = `
        <div class="eJH8qe adDDi" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
        ">
        <span class="mgAbYb RES9jf YC72Wc IFnjPb JGD2rd" aria-level="2" role="heading">People also ask</span>
        <span style="
            transform: skew(-0.25rad);
            border-radius: 5px;
            background-color: #ff8c42;
            padding: 2px 12px;
            display: inline flow-root;
            color: #fef5ec;
            font: normal normal 500 16px 'Source Sans 3', sans-serif;
            ">DESLOPIFIED</span>
        </div>`;
    for (const suggestion of suggestions) {
        string = string.concat(createPPALink(suggestion));
    }
    return string;
}

function getSuggestions(suggestionElement: Element): string[] {
    const queries: string[] = [];
    for (const child of suggestionElement.children) {
        let main: HTMLElement | null = null;
        try {
            main = child.children[0].children[0];
        } catch (TypeError) {
            console.error("Deslopify: child missing? Continuing...");
            main = null;
        }

        if (!main) {
            continue;
        }

        const query = main.getAttribute("data-q");
        if (typeof query === "string") {
            queries.push(query);
        }
    }
    return queries;
}

/**
 * This function handles the deslopification of Google's 'People Also Ask'
 * questions. This is through the observation that all non-AI 'People Also Ask'
 * popups appear to have the class Sbgr0, so 'People Also Ask' popups without
 * the class are changed.
 * This function formerly simply deleted them, but as of Sep 2026, it appears
 * that all Google 'People Also Ask' questions are AI now, so this edits them
 * to replace them with a link to the relevant search, akin to how they used
 * to be not as integrated.
 */
function removePeopleAlsoAsk(): void {
    // Get elements with Sbgr0, and add 'noai: true' to parent elements
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
    // // We want to get all children of LQCGqc, and check for the injected 'noai'
    // Any children without noai will be changed to queries.
    const peopleAlsoAsk = document.getElementsByClassName("LQCGqc");
    for (const e of peopleAlsoAsk) {
        let hasNoNonAI: boolean = true;
        const children: HTMLElement[] = Array.from(e.children);
        let questions: HTMLElement[] = [];
        let parent: HTMLElement | null = e.parentElement;

        if (parent && parent.getAttribute("class") !== "Wt5Tfe") {
            parent = null;
        }

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

        // Replace the whole box
        if (hasNoNonAI && parent) {
            // // parent.style.display = "none";
            // Here we get each suggestion.
            const queries: string[] = getSuggestions(e);
            const newHTML: string = createPeopleAlsoAsk(queries);
            parent.innerHTML = newHTML;
        }
    }
}

function createPronunciation(word: string): string {
    return `
<div id="deslopify-audio" class="ZZKfne" style="display: none;">
    <div>
        <audio id="deslopify-audio-mp3" preload="auto">
        <source src="//ssl.gstatic.com/dictionary/static/sounds/20250617/${word}--_gb_1.mp3">
        </audio>
        <div>
        <button id="deslopify-audio-button" class="HxxZfc mY3e9c u9H4O" aria-label="Listen">
            <div class="CukQkf" style="display: flex; justify-content: center; align-items: center; ">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-volume">
                <!-- Icon by https://github.com/tabler/tabler-icons, MIT Licence -->
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M15 8a5 5 0 0 1 0 8" />
                    <path d="M17.7 5a9 9 0 0 1 0 14" />
                    <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                </svg>
            </div>
        </button>
        </div>
    </div>
    <div class="NX85qc">
        <div class="st0Ipe">${word}</div>
        <div id="deslopify-audio-ipa" class="ohUzqc" style="display: none;">/prəˈnaʊn(t)s/</div>
    </div>
</div>`;
}

const extraStyles = ".HxxZfc{align-items:center;appearance:none;background-attachment:scroll;background-clip:border-box;background-color:#0b57d0;background-image:none;background-origin:padding-box;background-position-x:0%;background-position-y:0%;background-repeat:repeat;background-size:auto;block-size:40px;border-bottom-color:#fff;border-bottom-style:none;border-bottom-width:0;border-end-end-radius:20px;border-end-start-radius:20px;border-image-outset:0;border-image-repeat:stretch;border-image-slice:100%;border-image-source:none;border-image-width:1;border-left-color:#fff;border-left-style:none;border-left-width:0;border-right-color:#fff;border-right-style:none;border-right-width:0;border-start-end-radius:20px;border-start-start-radius:20px;border-top-color:#fff;border-top-style:none;border-top-width:0;box-sizing:border-box;color:#fff;cursor:pointer;display:inline-flex;fill:#fff;font-family:Noto Sans;font-size:13.3333px;inline-size:40px;justify-content:center;line-height:normal;margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;outline-color:#fff;outline-style:none;outline-width:0;position:relative;text-rendering:auto;user-select:none;will-change:transform,opacity}.NX85qc{align-items:flex-start;color:#e8e8e8;display:flex;flex-direction:column;font-family:sans-serif;font-size:14px;justify-content:center}.st0Ipe{color:#e8eaf2;font-family:Google Sans,sans-serif;font-size:28px;font-weight:400;letter-spacing:normal;line-height:36px}.ohUzqc{color:#a7a9b2;display:none;font-family:sans-serif;font-size:12px;font-weight:400;letter-spacing:normal;line-height:16px}"

function defineDictionaryWord(): void {
    const params: URLSearchParams = new URL(window.location.href).searchParams;
    const query: string | null = params.get("q");
    if (!query) throw Error("where query?");
    const words: string[] = query.split("define ");
    const word: string = words[words.length - 1].trim();
    if (word.indexOf(" ") > -1) throw Error("too long vro");
    const parent = document.getElementById("eKIzJc");
    if (!parent) throw Error("where parent?");

    const styleOverride = document.createElement("style");
    styleOverride.textContent = extraStyles;
    document.head.appendChild(styleOverride);

    const newHTML: string = createPronunciation(word);
    parent.innerHTML = newHTML;

    const pronunciation = document.getElementById("deslopify-audio");
    const audio = document.getElementById("deslopify-audio-mp3");
    const button = document.getElementById("deslopify-audio-button");

    if (!(pronunciation && audio && button)) throw Error("where elements?");

    button.addEventListener("click", () => {
        audio.play();
    });
    audio.addEventListener("canplay", () => {
        pronunciation.style = "display: block;";
    });

    audio.addEventListener("loadeddata", () => {
        if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            pronunciation.style = "display: block;";
        }
    });

    // TODO: add the dictionary
}

async function markAsAI(): Promise<void> {
    const allResults = document.getElementsByClassName("zReHs");
    for (const e of allResults) {
        /* * INFO:
        This approach is not perfect as it has been observed that Google
        Search is likely to return /goto? addresses if not signed in.
        However, I spent a fortnight attempting to decode it and gave
        up so I just didn't bother anymore.
        Probably a TODO, but whether it is even possible is another 
        question; it could be non-reversible, e.g. a server-side hash
        table, as the /goto? links have a redirect to the actual page.
        Regardless, assume that doesn't happen.
        Sincerely, me (SolidLamp) */
        const href: string | null = e.getAttribute("href");
        let url: string = "none";
        try {
            // breaks out for google urls.
            url = href ? new URL(href).hostname : "none";
        } catch (TypeError) {
            url = "none";
        }

        if (url === "none") {
            continue;
        }

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

        console.log(aiWebsites);
        console.log(proaiWebsites);
        console.log(antiaiWebsites);
        console.log(
            `${url}; ${aiWebsites.has(url)}; ${
                url in blocklist
            }; ${proaiWebsites.has(url)}; ${antiaiWebsites.has(url)}; `,
        );
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

    defineDictionaryWord();

    const observer = new MutationObserver(() => {
        removePeopleAlsoAsk();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
