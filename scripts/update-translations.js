import fs from 'fs';

const oldJson = fs.readFileSync('./src/data/import/filters-keys.json');
const allTable = JSON.parse(oldJson);

const version = 1893;

const locales = [
    ['fr', 'fr'],
    ['en', 'en'],
    ['de', 'de_DE'],
    ['it', 'it_IT'],
    ['es', 'es_ES'],
    ['jp', 'ja_JP'],
    ['ru', 'ru_RU']
];

for (const [tableKey, urlKey] of locales) {
    const url = `https://www.hentaiheroes.com/phoenix-tr_labels-${urlKey}-${version}.js`;
    const response = await fetch(url);
    const code = await response.text();
    const Phoenix = Function(`const Phoenix = {}; ${code}; return Phoenix;`)();
    const colors = Phoenix.__.HH_colors;
    const zodiac = Phoenix.__.zodiac;
    const design = Phoenix.__.HH_design;
    const keyValues = [];

    // Rarity
    ['starting', 'common', 'rare', 'epic', 'legendary', 'mythic'].forEach((e) => {
        const key = e;
        const value = design[`girls_rarity_${e}`]?.trim();
        if (value != null) keyValues.push([key, value]);
    });

    // Colors
    Object.entries(colors).forEach((e) => {
        const key = e[0];
        const value = e[1]?.trim();
        if (value != null) keyValues.push([key, value]);
    });

    // Element
    [
        'fire',
        'water',
        'sun',
        'stone',
        'nature',
        'psychic',
        'light',
        'darkness'
    ].forEach((e) => {
        const key = `${e}_flavor_element`;
        const value = design[key]?.trim();
        if (value != null) keyValues.push([key, value]);
    });

    // Zodiac
    [
        ['♈︎', 'aries'],
        ['♉︎', 'taurus'],
        ['♊︎', 'gemini'],
        ['♋︎', 'cancer'],
        ['♌︎', 'leo'],
        ['♍︎', 'virgo'],
        ['♎︎', 'libra'],
        ['♏︎', 'scorpio'],
        ['♐︎', 'sagittarius'],
        ['♑︎', 'capricorn'],
        ['♒︎', 'aquarius'],
        ['♓︎', 'pisces']
    ].forEach(([sign, key]) => {
        const name = zodiac[key]?.trim();
        if (name != null) {
            const value = `${sign} ${name}`;
            keyValues.push([sign, value]);
        }
    });

    let table = allTable[tableKey];
    keyValues.forEach(([key, newValue]) => {
        const oldValue = table[key];
        if (newValue !== oldValue) {
            table[key] = newValue;
            // Try not to change the order.
            table = Object.fromEntries(
                Object.entries(table).map(([key, value]) => {
                    return [key === oldValue ? newValue : key, value];
                })
            );
            table[newValue] = key;
        }
    });
    allTable[tableKey] = table;
}

const newJson = JSON.stringify(allTable, null, 2);
fs.writeFileSync('./src/data/import/filters-keys.json', newJson);
