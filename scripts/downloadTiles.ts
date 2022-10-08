// import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const zoomExtent = [2, 2];
const outputDir = path.resolve(__dirname, '../demo/tiles/epsg4326');

const scrapeTile = async ([x, y, z]: number[]) => {
  const url = `https://api.maptiler.com/maps/basic-4326/256/${z}/${x}/${y}.png?key=bS8WSqUoVgfQRrMrQuvE`;
  // fetch(url)
  //   .then(req => req.blob())
  //   .then(blob => console.log(blob));
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })

  const tileDir = path.resolve(outputDir, `${z}/${x}`);
  const tileFilepath = path.resolve(tileDir, `${y}.png`);
  
  await fs.mkdirSync(tileDir, { recursive: true });
  await fs.writeFileSync(tileFilepath, data);

}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  for (let z = zoomExtent[0]; z <= zoomExtent[1]; z++) {
    const extent = [2 << z, 1 << z];
    for (let x = 0; x < extent[0]; x++) {
      for (let y = 0; y < extent[1]; y++) {
        console.log(`${z}/${x}/${y}`);
        await scrapeTile([x, y, z]);
        await delay(Math.random() * 1000);
      }
    }
  }
}


main();
