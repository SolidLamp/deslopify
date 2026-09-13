/*  Deslopify site-specific script: Warnings for AI websites on Ecosia
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

// For ecosia.org

const hostname = window.location.hostname;
let domain = hostname;
if (hostname.substring(0, 4) == "www.") {
    domain = hostname.slice(4);
}

if (domain.substring(0, 6) != "ecosia") {
    throw new Error("Not Ecosia.");
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
    await markAsAI("result__link", 5);
})();
