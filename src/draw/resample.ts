import * as tilebelt from 'tilebelt-wgs84';
import { ReprojectionMethod } from "../types";
import { mercatorBboxToLngLatBbox, mercatorToLngLat } from '../proj';
import { canvasContextToArrayBuffer, createCanvasContext, drawSourceCanvas } from "./common";

export const resampleTiles: ReprojectionMethod = async (tileSize, sources, mercatorBbox) => {
  const wgs84Canvas = drawSourceCanvas(sources, tileSize);

  // The source tile canvas offset since wgsCanvas origin is the most nw tile
  const sxOffset = Math.min(...sources.map(d => d.tile[0])) * tileSize;
  const syOffset = Math.min(...sources.map(d => d.tile[1])) * tileSize;

  // Find source tile zoom level using first tile
  const sTileZoom = sources[0].tile[2]; 
  const [matrixWidth, matrixHeight] = tilebelt.getExtent(sTileZoom);

  const latToPx = (lat: number) => tilebelt.normalizeLat(lat) * matrixHeight * tileSize - syOffset;

  const lngLatBbox = mercatorBboxToLngLatBbox(mercatorBbox);
  const sx0 = tilebelt.normalizeLng(lngLatBbox[0]) * matrixWidth * tileSize - sxOffset;
  const sx1 = tilebelt.normalizeLng(lngLatBbox[2]) * matrixWidth * tileSize - sxOffset;
  const sWidth = sx1 - sx0;

  const mercatorLatPerPx = (mercatorBbox[3] - mercatorBbox[1]) / tileSize;

  const mercatorCanvas = createCanvasContext(tileSize, tileSize);
  // Iterate all y pixels
  for (let i = 0; i < tileSize; i += 1) {    
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