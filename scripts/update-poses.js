const fs = require('fs');

updatePoses(
    'https://docs.google.com/spreadsheets/d/1kVZxcZZMa82lS4k-IpxTTTELAeaipjR_v1twlqW5vbI/export?format=tsv&gid=0',
    './src/data/import/poses_hh_hentai.json'
);
updatePoses(
    'https://docs.google.com/spreadsheets/d/1g-5kmvlHhA728yTF7xMdKfWuMe9-SqxW-QDdjc26J6I/export?format=tsv&gid=0',
    './src/data/import/poses_hh_comix.json'
);

async function updatePoses(
    spreadsheet,
    posesFile
) {
    const tsv = await (await fetch(spreadsheet)).text();
    const rows = tsv.split('\r\n');
    const headerColumns = rows[1].split('\t');
    const positionIndex = headerColumns.indexOf('Favorite Position');
    const bodyRows = rows.slice(2);
    const positionMap = Object.fromEntries(
        [
            'All',
            'Doggie style',
            'Dolphin',
            'Missionary',
            'Sodomy',
            '69',
            'Jack Hammer',
            'Nose Dive',
            'Column',
            'Indian Headstand',
            'Suspended Congress',
            'Splitting Bamboo',
            'Bridge'
        ].map((e, i) => [e.toLowerCase(), i])
    );
    const poseList = bodyRows
        .map((row) => row.split('\t'))
        .map((columns) => ({
            id: columns[1],
            position: positionMap[columns[positionIndex].toLowerCase()]
        }))
        .filter((e) => e.id !== '' && e.position != null);
    poseList.sort((x, y) => x.id - y.id);
    const poseMap = Object.fromEntries(
        poseList.map(({ id, position }) => [id, position])
    );
    fs.writeFileSync(
        posesFile,
        JSON.stringify(poseMap, null, 2)
    );
}
