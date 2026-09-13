import blocklist from "../blocklist.json" with { type: "json" };
import warninglist from "../warninglist.json" with { type: "json" };

const aiWebsites: Set<string> = Array.isArray(warninglist.ai)
    ? new Set(warninglist.ai)
    : new Set();
const proaiWebsites: Set<string> = Array.isArray(warninglist.proai)
    ? new Set(warninglist.proai)
    : new Set();
const antiaiWebsites: Set<string> = Array.isArray(warninglist.antiai)
    ? new Set(warninglist.antiai)
    : new Set();

const defaultWarningStyle: string = `transform: skew(-0.25rad); 
border-radius: 5px; 
background-color: #ff8c42; 
padding: 2px 12px; 
display: inline flow-root; 
color: #fef5ec; 
font: normal normal 500 16px 'Source Sans 3', sans-serif;`;

/**
 * A function to add AI warnings to search results on search engines.
 *
 * @param className - The name of the class of each result on the
 * search engine. Should be the element of the result which contains the href,
 * not the ultimate ancestor.
 * @param ancestorNumber - The number of ancestors to navigate through to get
 * to the highest element that contains the visual search result. e.g. 1 =
 * immediate parent, 2 = grandparent, etc.
 * @param customStyle - A string containing valid CSS to be placed as the
 * style property of the created warning. Useful for making the warning blend
 * in with the search engine's design language.
 */
export async function markAsAI(
    className: string,
    ancestorNumber: number,
    customStyle?: string,
): Promise<void> {
    const allResults = document.getElementsByClassName(className);
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

        let parent: Element | null = e;
        try {
            for (let i = 0; i < ancestorNumber; i++) {
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

        if (parent.querySelector(".deslopify-ai-warning")) return;

        // This again
        if (url.substring(0, 4) == "www.") {
            url = url.slice(4);
        }

        // Now we do the visual stuff
        const aiWarning = document.createElement("span");
        aiWarning.classList.add("deslopify-ai-warning");
        aiWarning.style = customStyle ? customStyle : defaultWarningStyle;

        // possibly should make this configurable
        // not today's problem
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
