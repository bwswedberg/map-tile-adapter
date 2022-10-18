import { Bbox, ReprojTransform, Tile } from "../types";
import { createCanvasContext } from '../util';

export const drawSourceCanvas = (
  sources: { tile: Tile, image: HTMLImageElement, bbox: Bbox }[], 
  tileSize: number,
  transform: ReprojTransform
) => {
  const zoom = sources[0].tile[2];

  const sp0 = transform.sourceToPixel([
    Math.min(...sources.map(d => d.bbox[0])),
    Math.min(...sources.map(d => d.bbox[1]))
  ], { zoom, tileSize });

  const sp1 = transform.sourceToPixel([
    Math.max(...sources.map(d => d.bbox[2])),
    Math.max(...sources.map(d => d.bbox[3]))
  ], { zoom, tileSize });

  const sBbox = [
    Math.min(sp0[0], sp1[0]),
    Math.min(sp0[1], sp1[1]),
    Math.max(sp0[0], sp1[0]),
    Math.max(sp0[1], sp1[1]),
  ];

  const canvasCtx = createCanvasContext(
    sBbox[2] - sBbox[0], // width
    sBbox[3] - sBbox[1] // height
  );

  // Create working canvas to access fetched images
  for (const { bbox, image } of sources) {
    const t0 = transform.sourceToPixel([bbox[0], bbox[1]], { zoom, tileSize });
    const t1 = transform.sourceToPixel([bbox[2], bbox[3]], { zoom, tileSize });

    const tBbox = [
      Math.min(t0[0], t1[0]),
      Math.min(t0[1], t1[1]),
      Math.max(t0[0], t1[0]),
      Math.max(t0[1], t1[1]),
    ];

    canvasCtx.drawImage(
      image, 
      tBbox[0] - sBbox[0], // sx
      tBbox[1] - sBbox[1] // sy
    );
  }
  
  return {
    translate: [sBbox[0], sBbox[1]],
    zoom,
    tileSize,
    canvas: canvasCtx.canvas
  };
};