import * as tilebelt from 'tilebelt-wgs84';
import { ReprojectionMethod } from "../types";
import { canvasContextToArrayBuffer, createCanvasContext } from "./common";

export const spliceTiles: ReprojectionMethod = async (tileSize, tiles, mercatorBbox, lngLatBbox) => {
  const mercatorCanvas = createCanvasContext(tileSize, tileSize);

  if (!mercatorCanvas) {
    throw new Error('Mercator canvas does not exist');
  }
  
  // Splice images together and stretch to fit mercator tile
  // - clip tile by mercator latlng bbox
  // - transform to fit place on mercator tile
  for (const { tile, image } of tiles) {
    const tileBbox = tilebelt.tileToBBox(tile);
    const iBbox = tilebelt.intersectBboxes(lngLatBbox, tileBbox);
    if (!iBbox) break;

    // Normalize tile to 0 - 1 then get in source pixels
    const sBbox = [
      (iBbox[0] - tileBbox[0]) / (tileBbox[2] - tileBbox[0]),
      1 - (iBbox[1] - tileBbox[1]) / (tileBbox[3] - tileBbox[1]), // inverse lat
      (iBbox[2] - tileBbox[0]) / (tileBbox[2] - tileBbox[0]),
      1 - (iBbox[3] - tileBbox[1]) / (tileBbox[3] - tileBbox[1]), // inverse lat
    ].map(d => d * tileSize);

    const dBbox = [
      (iBbox[0] - lngLatBbox[0]) / (lngLatBbox[2] - lngLatBbox[0]),
      1 - (iBbox[1] - lngLatBbox[1]) / (lngLatBbox[3] - lngLatBbox[1]), // inverse lat
      (iBbox[2] - lngLatBbox[0]) / (lngLatBbox[2] - lngLatBbox[0]),
      1 - (iBbox[3] - lngLatBbox[1]) / (lngLatBbox[3] - lngLatBbox[1]), // inverse lat
    ].map(d => d * tileSize);

    mercatorCanvas.drawImage(
      image, 
      sBbox[0], // sx 
      sBbox[1], // sy
      sBbox[2] - sBbox[0], // sWidth 
      sBbox[3] - sBbox[1], // sHeight, 
      dBbox[0], // dx 
      dBbox[1], // dy, 
      dBbox[2] - dBbox[0], // dWidth, 
      dBbox[3] - dBbox[1] // dHeight
    );
  }
  return await canvasContextToArrayBuffer(mercatorCanvas);
};