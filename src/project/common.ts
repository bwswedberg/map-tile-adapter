import proj4 from 'proj4';

const mercatorProj = proj4('EPSG:3857', 'EPSG:4326');
export const mercatorToLngLat = (lngLat: number[]) => mercatorProj.forward(lngLat);

export const createCanvasContext = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
};

export const canvasContextToArrayBuffer = async (
  canvasContext: CanvasRenderingContext2D
): Promise<ArrayBuffer | null> => {
  return await new Promise((resolve) => {
    canvasContext.canvas.toBlob(async blob => {
      if (!blob) return resolve(null);
      const buf = await blob.arrayBuffer();
      resolve(buf);
    });
  });
}
