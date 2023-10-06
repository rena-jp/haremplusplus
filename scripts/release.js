const fs = require('fs');

const jsDir = './build/static/js/';
const jsFile = jsDir + fs.readdirSync(jsDir).filter(e => e.endsWith('.js'))[0];
const jsCode = fs.readFileSync(jsFile).toString().split('\n')[1];

const cssDir = './build/static/css/';
const cssFile = cssDir + fs.readdirSync(cssDir).filter(e => e.endsWith('.css'))[0];
const cssCode = fs.readFileSync(cssFile).toString().split('\n')[0];

const packageJson = require('../package.json');

const output = `// ==UserScript==
// @name         Harem++ (Temp.)
// @namespace    https://github.com/rena-jp/haremplusplus
// @version      ${packageJson.version}
// @description  Replace the original Harem page with a quicker, more dynamic version
// @author       Liliat, rena-jp
// @match        https://*.hentaiheroes.com/*
// @match        https://nutaku.haremheroes.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @updateURL    https://raw.githubusercontent.com/rena-jp/haremplusplus/main/release/haremplusplus.user.js
// @downloadURL  https://raw.githubusercontent.com/rena-jp/haremplusplus/main/release/haremplusplus.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

// Main Application
` + jsCode + `

// CSS rules
(function() {
    'use strict';

    function addStyle(cssContent) {
        const head = document.getElementsByTagName('head')[0];
        if (head) {
            const style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.textContent = cssContent;
            head.appendChild(style);
            return style;
        }
        return undefined;
    }

    addStyle(\`
        ` + cssCode + `
    \`);
})();
`;

fs.writeFileSync(
    './release/haremplusplus.user.js',
    output
);
