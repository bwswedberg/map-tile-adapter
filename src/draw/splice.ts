import * as tilebelt from 'tilebelt-wgs84';
import { mercatorBboxToLngLatBbox } from '../proj';
import { Bbox, ReprojectionMethod } from "../types";
import { canvasContextToArrayBuffer, createCanvasContext, drawSourceCanvas } from "./common";

export const spliceTiles: ReprojectionMethod = async (tileSize, sources, mercatorBbox) => {
  const wgs84Canvas = drawSourceCanvas(sources, tileSize);

  // The source tile canvas offset since wgsCanvas origin is the most nw tile
  const sxOffset = Math.min(...sources.map(d => d.tile[0])) * tileSize;
  const syOffset = Math.min(...sources.map(d => d.tile[1])) * tileSize;

  // Find source tile zoom level using first tile
  const sTileZoom = sources[0].tile[2]; 
  const [matrixWidth, matrixHeight] = tilebelt.getExtent(sTileZoom);

  // Output tile bbox
  const lngLatBbox = mercatorBboxToLngLatBbox(mercatorBbox);

  // Source tile bbox that will fill the mercator bbox
  const sBbox: Bbox = [
    tilebelt.normalizeLng(lngLatBbox[0]) * matrixWidth * tileSize - sxOffset,
    tilebelt.normalizeLat(lngLatBbox[1]) * matrixHeight * tileSize - syOffset,
    tilebelt.normalizeLng(lngLatBbox[2]) * matrixWidth * tileSize - sxOffset,
    tilebelt.normalizeLat(lngLatBbox[3]) * matrixHeight * tileSize - syOffset
  ];

  const mercatorCanvas = createCanvasContext(tileSize, tileSize);

  mercatorCanvas.drawImage(
    wgs84Canvas.canvas, 
    sBbox[0], // sx 
    sBbox[1], // sy
    sBbox[2] - sBbox[0], // sWidth 
    sBbox[3] - sBbox[1], // sHeight, 
    0, // dx 
    0, // dy, 
    tileSize, // dWidth, 
    tileSize // dHeight
  );
  return await canvasContextToArrayBuffer(mercatorCanvas);
};