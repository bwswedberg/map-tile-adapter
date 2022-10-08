import * as tilebelt from 'tilebelt-wgs84';
import { ReprojectionMethod } from "../types";
import { mercatorToLngLat } from '../proj';
import { canvasContextToArrayBuffer, createCanvasContext } from "./common";

export const resampleTiles: ReprojectionMethod = async (tileSize, tiles, mercatorBbox, lngLatBbox) => {
  const sTileBbox = [
    Math.min(...tiles.map(d => d.tile[0])),
    Math.min(...tiles.map(d => d.tile[1])),
    Math.max(...tiles.map(d => d.tile[0])),
    Math.max(...tiles.map(d => d.tile[1])),
  ];
  const mercatorCanvas = createCanvasContext(tileSize, tileSize);
  const sTileZoom = tiles[0].tile[2]; // Use first tile zoom
  const [matrixWidth, matrixHeight] = tilebelt.getExtent(sTileZoom);
  const wgs84Canvas = createCanvasContext(
    (sTileBbox[2] - sTileBbox[0]) * tileSize + tileSize, 
    (sTileBbox[3] - sTileBbox[1]) * tileSize + tileSize
  );

  if (!mercatorCanvas || !wgs84Canvas) {
    throw new Error('Mercator canvas does not exist');
  }
  
  const sxOffset = sTileBbox[0] * tileSize;
  const syOffset = sTileBbox[1] * tileSize;

  // Create working canvas to access fetched images
  for (const { tile, image } of tiles) {
    wgs84Canvas.drawImage(
      image, 
      tile[0] * tileSize - sxOffset, // sx
      tile[1] * tileSize - syOffset // sy
    );
  }

  const latToPx = (lat: number) => tilebelt.normalizeLat(lat) * matrixHeight * tileSize - syOffset;

  const sx0 = tilebelt.normalizeLng(lngLatBbox[0]) * matrixWidth * tileSize - sxOffset;
  const sx1 = tilebelt.normalizeLng(lngLatBbox[2]) * matrixWidth * tileSize - sxOffset;
  const sWidth = sx1 - sx0;

  const mercatorLatPerPx = (mercatorBbox[3] - mercatorBbox[1]) / tileSize;

  // Iterate all y pixels
  for (let i = 0; i < tileSize; i++) {    
    const mercatorLat0 = mercatorBbox[3] - (mercatorLatPerPx * i);
    const mercatorLat1 = mercatorLat0 - mercatorLatPerPx;
    const sy0 = latToPx(mercatorToLngLat([mercatorBbox[0], mercatorLat0])[1]);
    const sy1 = latToPx(mercatorToLngLat([mercatorBbox[0], mercatorLat1])[1]);

    // Ensure we are drawing at least 1 pixel
    const sHeight = Math.max(sy1 - sy0, 1);

    // Draw row
    mercatorCanvas.drawImage(
      wgs84Canvas.canvas, 
      sx0, // sx 
      sy0, // sy
      sWidth, // sWidth 
      sHeight, // sHeight, 
      0, // dx 
      i, // dy, 
      tileSize, // dWidth, 
      1 // dHeight (i.e. 1 pixel)
    );
  }

  return await canvasContextToArrayBuffer(mercatorCanvas);
};