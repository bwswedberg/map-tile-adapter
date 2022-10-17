import { Bbox, ReprojContext2, Tile } from "../types";
import { canvasContextToArrayBuffer, createCanvasContext } from "../util";
import { drawSourceCanvas2 } from "./source";

export const drawDestination = async (
  ctx: ReprojContext2,
  sources: { tile: Tile, image: HTMLImageElement, bbox: Bbox }[],
  destination: { tile: Tile, bbox: Bbox },
  src?: { canvas: HTMLCanvasElement, translate: number[], tileSize: number, zoom: number },
  dest?: { canvas: HTMLCanvasElement, translate: number[], tileSize: number, zoom: number },
) => {
  const { 
    tileSize, 
    resamplingInterval, 
    transform: {
      sourceToPixel,
      destinationToSource,
      pixelToDestination,
      destinationToPixel
    }
  } = ctx;
  const source = drawSourceCanvas2(sources, ctx.tileSize, ctx.transform);

  const destinationCanvasCtx = createCanvasContext(tileSize, tileSize);

  const destinationCtx = { 
    zoom: destination.tile[2],
    tileSize,
  };

  const sourceCtx = { 
    zoom: sources[0].tile[2],
    tileSize,
  };

  const dp0 = destinationToPixel([destination.bbox[0], destination.bbox[1]], destinationCtx);
  const dp1 = destinationToPixel([destination.bbox[2], destination.bbox[3]], destinationCtx);
  const dTranslate = [
    Math.min(dp0[0], dp1[0]),
    Math.min(dp0[1], dp1[1]),
  ];

  const [dxInterval, dyInterval] = resamplingInterval;

  for (let dx = 0; dx < tileSize; dx += dxInterval) {
    // Handle when tileSize is not divisible by x interval
    const dWidth = Math.min(dxInterval, tileSize - dx);

    for (let dy = 0; dy < tileSize; dy += dyInterval) {  
      // Handle when tileSize is not divisible by y interval
      const dHeight = Math.min(dyInterval, tileSize - dy);

      const dBbox = [
        dx + dTranslate[0],
        dy + dTranslate[1],
        dx + dTranslate[0] + dWidth,
        dy + dTranslate[1] + dHeight,
      ];

      const sp0 = sourceToPixel(destinationToSource(pixelToDestination([dBbox[0], dBbox[1]], destinationCtx)), sourceCtx);
      const sp1 = sourceToPixel(destinationToSource(pixelToDestination([dBbox[2], dBbox[3]], destinationCtx)), sourceCtx);

      const sBbox = [
        Math.min(sp0[0], sp1[0]),
        Math.min(sp0[1], sp1[1]),
        Math.max(sp0[0], sp1[0]),
        Math.max(sp0[1], sp1[1]),
      ];

      // Draw slice of destinaton tile
      destinationCanvasCtx.drawImage(
        source.canvas, 
        sBbox[0] - source.translate[0], // sx 
        sBbox[1] - source.translate[1], // sy
        sBbox[2] - sBbox[0], // sWidth 
        sBbox[3] - sBbox[1], // sHeight, 
        dx, // dx 
        dy, // dy, 
        dWidth, // dWidth, 
        dHeight // dHeight
      );
    }
  }

  return await canvasContextToArrayBuffer(destinationCanvasCtx);
};