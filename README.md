# Amazon.fr Prix au Litre

Userscript showing the price per litre on Amazon.fr search results.

[![Userscript](https://img.shields.io/badge/userscript-v1.0-blue)](amazon-fr-prix-au-litre.user.js) [![License: MPL 2.0](https://img.shields.io/badge/license-MPL%202.0-brightgreen)](LICENSE) [![No dependencies](https://img.shields.io/badge/dependencies-none-lightgrey)](#how-it-works)

Amazon lists a bottle at one price and a six-pack at another, and leaves you to work out which is cheaper. This script does that arithmetic for you.

## What it does

- Computes and displays the price per litre directly in search results.
- Lets you compare formats at a glance instead of opening each listing.

## Where it runs

- `amazon.fr/s*`
- `amazon.fr/*/s*`

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open [`amazon-fr-prix-au-litre.user.js`](amazon-fr-prix-au-litre.user.js) and click **Raw**.

Tampermonkey picks up the install prompt automatically. Updates are served through `@updateURL`, so later versions are offered without reinstalling.

## How it works

A single `.user.js` file of plain DOM code: no build step, no bundler, no external library.

## Known limitations

- Selectors track the site's current markup and will need updating when it changes.

## License

[Mozilla Public License 2.0](LICENSE).
