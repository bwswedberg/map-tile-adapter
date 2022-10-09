import { Tile } from "../types";

export const createCanvasContext = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error('Failed to create canvas context 2d.');
  return ctx;
};

export const canvasContextToArrayBuffer = async (
  canvasContext: CanvasRenderingContext2D
): Promise<ArrayBuffer | null> => {
  return await new Promise((resolve, reject) => {
    canvasContext.canvas.toBlob(async blob => {
      if (!blob) return resolve(null);
      try {
        const buf = await blob.arrayBuffer();
        resolve(buf);
      } catch (error) {
        reject(error)
      }
    });
  });
};

export const drawSourceCanvas = (sources: { tile: Tile, image: HTMLImageElement }[], tileSize: number) => {
  // Find source tile bbox
  const sTileBbox = [
    Math.min(...sources.map(d => d.tile[0])),
    Math.min(...sources.map(d => d.tile[1])),
    Math.max(...sources.map(d => d.tile[0])),
    Math.max(...sources.map(d => d.tile[1])),
  ];

  // Create canvas using source tiles in wgs84. Canvas size fits source tile bbox
  const wgs84Canvas = createCanvasContext(
    (sTileBbox[2] - sTileBbox[0]) * tileSize + tileSize, 
    (sTileBbox[3] - sTileBbox[1]) * tileSize + tileSize
  );

  // Create working canvas to access fetched images
  for (const { tile, image } of sources) {
    wgs84Canvas.drawImage(
      image, 
      (tile[0] - sTileBbox[0]) * tileSize, // sx
      (tile[1] - sTileBbox[1]) * tileSize // sy
    );
  }

  return wgs84Canvas;
}
