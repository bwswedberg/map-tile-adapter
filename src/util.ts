import { Bbox, Tile } from "./types";

export const createCanvasContext = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context 2d');
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

export const fetchImage = async (url: string): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>(async (resolve, reject) => {
    try {
      const image = new Image();
      image.crossOrigin = '';
      image.src = url;
      await image.decode();
      resolve(image);
    } catch (error) {
      reject(error);
    }
  });
};

export const getImageUrl = (
  urlTemplate: string,
  tile: Tile,
  lngLatBbox: Bbox,
) => {
  return (
    urlTemplate
      .replace('{bbox-epsg-4326}', `${lngLatBbox.join(',')}`)
      .replace('{x-epsg-4326}', `${tile[0]}`)
      .replace('{y-epsg-4326}', `${tile[1]}`)
      .replace('{z-epsg-4326}', `${tile[2]}`)
  );
};

