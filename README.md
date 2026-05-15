# Deslopify

<img src="./src/icons/icon.svg" alt="Logo" width="10%" />

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/SolidLamp/deslopify?style=plastic)
![GitHub commits since latest release (branch)](https://img.shields.io/github/commits-since/SolidLamp/deslopify/latest/next?style=plastic)
![GitHub Issues or Pull Requests by label](https://img.shields.io/github/issues/SolidLamp/deslopify/blocklist?style=plastic)
![Weekly Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Faddons.mozilla.org%2Fapi%2Fv5%2Faddons%2Faddon%2Fdeslopify%2F&query=weekly_downloads&suffix=%20downloads%2Fweek&style=plastic&label=Firefox%20Add-ons&labelColor=%23FF662B&color=%238836D3)


[Get Deslopify on Firefox Addons!](https://addons.mozilla.org/en-GB/firefox/addon/deslopify)

***

## About

> [!NOTE]
> [Deslopify needs your help! Please open issues to add any websites that implement AI slop elements - no programming knowledge needed!](https://github.com/SolidLamp/deslopify/issues)

Deslopify is a WebExtension content blocker developed in TypeScript which detects 'in-your-face' AI-related elements and removes them from webpages.

Many websites have began to embed AI assistants or other AI elements which infringe on user experience, due to beliefs that 'anything can be improved by shoving AI in it'. Deslopify aims to reduce the damaged user experience, to allow for websites to be 'usable' despite their own introduction of AI.

> [!IMPORTANT]
> Deslopify does not aim to detect and/or block user-generated content (UGC) which was created with AI tooling, nor does it aim to block AI websites. The rationale is that there is no reason to believe that there would be no AI on chat.openai.com, whereas there would be all reason to believe that there would be no AI on dictionary.cambridge.org, for instance.

> "it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail."
> -- Abraham Maslow

> "Anything can be improved by shoving AI in it"
> -- Some modern website developer, probably.

## Building

Deslopify can be built easily, with a pre-prepared Makefile provided.

Given that you have [`npm`](https://www.npmjs.com/) and [`GNU Make`](https://www.gnu.org/software/make/) installed, you can run the following commands to build Deslopify:

```Shell
$ npm i
$ make
```

In the event where ```npm i``` does not properly install dependencies, or if you are using an alternative package manager, please refer to the dependencies listed in package.json.

Alternatively, ```make test``` can be used instead of ```make``` to generate a build which uses a unique UUID for testing purposes.

## Supported Websites

The current list of supported websites can be seen at blocklist.json. Support of websites may vary as websites are updated and new slop is added. Users are free to suggest improvements and add support for websites by raising issues.


## Other useful extensions/projects

Here are a number of other useful extensions or projects which help protect against artifical intelligence on the internet:

| Project | Comparison |
| :------ | :--------- |
| [uBlockOrigin-HUGE-AI-Blocklist](https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist) | A blocklist for [uBlock Origin](https://github.com/gorhill/uBlock) which blocks websites dedicated to AI. This is out of the scope of Deslopify, but many users may appreciate such a feature. |
| [Alerte sur les sites GenAI](https://github.com/Gathor59/Extension-Alerte-GenAI/tree/version-2) | An extension which detects if text is generated with AI tooling using heuristics, and provides an error message to the user in such case. (The extension is provided only in French.) |


