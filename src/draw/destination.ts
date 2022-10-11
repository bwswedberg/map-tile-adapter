import { Bbox, Tile } from "../types";
import { mercatorToLngLat } from '../proj';
import { canvasContextToArrayBuffer, createCanvasContext } from "./common";
import { drawSource } from "./source";

export const drawDestination = async (
  sources: { tile: Tile, image: HTMLImageElement }[],
  mercatorBbox: Bbox,
  tileSize: number,
  resamplingInterval: number[],
) => {
  const wgs84Source = drawSource(sources, tileSize);

  // Contains the destination image
  const mercatorCanvasCtx = createCanvasContext(tileSize, tileSize);

  const [dxInterval, dyInterval] = resamplingInterval;

  // Mercator meters per pixel
  const mxPerPixel = (mercatorBbox[2] - mercatorBbox[0]) / tileSize;
  const myPerPixel = (mercatorBbox[3] - mercatorBbox[1]) / tileSize;

  for (let dx = 0; dx < tileSize; dx += dxInterval) {
    // Handle when tileSize is not divisible by x interval
    const dWidth = Math.min(dxInterval, tileSize - dx);

    // Calculate xmin and xmax in mercator meters
    const mx0 = mercatorBbox[0] + (mxPerPixel * dx);
    const mx1 = mx0 + (mxPerPixel * dWidth);

    for (let dy = 0; dy < tileSize; dy += dyInterval) {    
      // Handle when tileSize is not divisible by y interval
      const dHeight = Math.min(dyInterval, tileSize - dy);

      // Calculate ymin and ymax in mercator meters
      const my0 = mercatorBbox[3] - (myPerPixel * dy);
      const my1 = my0 - (myPerPixel * dHeight);
      
      // Convert mercator bbox to lngLat bbox
      const sw = mercatorToLngLat([mx0, my0]);
      const ne = mercatorToLngLat([mx1, my1]);

      // Project lngLat bbox to source tiles pixel bbox
      const sBbox = [
        ...wgs84Source.lngLatToPixel(sw),
        ...wgs84Source.lngLatToPixel(ne)
      ];

      // Draw slice of mercator tile using the wgs84 source image
      mercatorCanvasCtx.drawImage(
        wgs84Source.canvas, 
        sBbox[0], // sx 
        sBbox[1], // sy
        sBbox[2] - sBbox[0], // sWidth 
        sBbox[3] - sBbox[1], // sHeight, 
        dx, // dx 
        dy, // dy, 
        dWidth, // dWidth, 
        dHeight // dHeight
      );
    }
  }

  return await canvasContextToArrayBuffer(mercatorCanvasCtx);
};