import * as tilebelt from 'tilebelt-wgs84';
import { ReprojectionMethod } from "../types";
import { mercatorBboxToLngLatBbox, mercatorToLngLat } from '../proj';
import { canvasContextToArrayBuffer, createCanvasContext, drawSourceCanvas } from "./common";

export const resampleTiles: ReprojectionMethod = async (tileSize, sources, mercatorBbox) => {
  const wgs84Canvas = drawSourceCanvas(sources, tileSize);

  // Offset since wgsCanvas origin is the most nw tile
  const wgs84CanvasOffset = [
    Math.min(...sources.map(d => d.tile[0])) * tileSize,
    Math.min(...sources.map(d => d.tile[1])) * tileSize
  ];

  // Find source tile zoom level using first tile
  const sTileZoom = sources[0].tile[2]; 
  const [matrixWidth, matrixHeight] = tilebelt.getExtent(sTileZoom);

  const lngToPx = (lng: number) => tilebelt.normalizeLng(lng) * matrixWidth * tileSize - wgs84CanvasOffset[0];
  const latToPx = (lat: number) => tilebelt.normalizeLat(lat) * matrixHeight * tileSize - wgs84CanvasOffset[1];

  const mercatorCanvas = createCanvasContext(tileSize, tileSize);

  const dxInterval = 256;
  const dyInterval = 1;

  const mxPerPixel = (mercatorBbox[2] - mercatorBbox[0]) / tileSize;
  const myPerPixel = (mercatorBbox[3] - mercatorBbox[1]) / tileSize;

  for (let dx = 0; dx < tileSize; dx += dxInterval) {
    const mx0 = mercatorBbox[0] + (mxPerPixel * dx);
    const mx1 = mx0 + (mxPerPixel * dxInterval);

    for (let dy = 0; dy < tileSize; dy += dyInterval) {    
      const my0 = mercatorBbox[3] - (myPerPixel * dy);
      const my1 = my0 - (myPerPixel * dyInterval);

      const sw = mercatorToLngLat([mx0, my0]);
      const ne = mercatorToLngLat([mx1, my1]);

      const sBbox = [
        lngToPx(sw[0]),
        latToPx(sw[1]),
        lngToPx(ne[0]),
        latToPx(ne[1])
      ];

      // Draw at least 1 pixel
      const sWidth = Math.max(sBbox[2] - sBbox[0], 1);
      const sHeight = Math.max(sBbox[3] - sBbox[1], 1);

      // Draw row
      mercatorCanvas.drawImage(
        wgs84Canvas.canvas, 
        sBbox[0], // sx 
        sBbox[1], // sy
        sWidth, // sWidth 
        sHeight, // sHeight, 
        dx, // dx 
        dy, // dy, 
        dxInterval, // dWidth, 
        dyInterval // dHeight
      );
    }
  }

  return await canvasContextToArrayBuffer(mercatorCanvas);
};