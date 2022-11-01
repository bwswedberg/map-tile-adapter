// import fetch from 'node-fetch';
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const trondheim = require('../cypress/fixtures/trondheim.json');

const outputDir = path.resolve(__dirname, '../tiles');

const scrapeTile = async ([x, y, z]) => {
  const url = `https://api.maptiler.com/maps/basic-4326/256/${z}/${x}/${y}.png?key=bS8WSqUoVgfQRrMrQuvE`;
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })

  const tileFilepath = path.resolve(outputDir, `${z}_${x}_${y}.png`);
  
  fs.writeFileSync(tileFilepath, data);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const main = async () => {
//   for (let z = zoomExtent[0]; z <= zoomExtent[1]; z++) {
//     const extent = [2 << z, 1 << z];
//     for (let x = 0; x < extent[0]; x++) {
//       for (let y = 0; y < extent[1]; y++) {
//         console.log(`${z}/${x}/${y}`);
//         await scrapeTile([x, y, z]);
//         await delay(Math.random() * 5000);
//       }
//     }
//   }
// }

const main = async () => {
  const { tiles } = trondheim.mappings
    .map(d => {
      return [...d.sources.map(d => d.tile), ...d.sources2x.map(d => d.tile)]
    })
    .reduce((acc, cur) => [...acc, ...cur], [])
    .reduce((acc, cur) => {
      const key = `${cur[0]}_${cur[1]}_${cur[2]}`;
      if (cur[2] < 1) return acc;
      if (acc.memo[key]) return acc;
      acc.memo[key] = true;
      acc.tiles.push(cur);
      return acc;
    }, { tiles: [], memo: {} });
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    console.log(`${i + 1} of ${tiles.length}`)
    await scrapeTile(tile);
    await delay(Math.random() * 5000);
  }
}

main();
