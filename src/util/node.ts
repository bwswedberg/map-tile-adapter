import { Canvas, createCanvas, Image } from 'canvas';

export const createNodeCanvasContext = (width: number, height: number) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  return ctx;
};

export const nodeCanvasToArrayBuffer = async (
  canvas: Canvas
): Promise<ArrayBuffer | null> => {
  return await new Promise((resolve, reject) => {
    canvas.toBuffer((err, buf) => {
      if (err) return reject(err);
      const arrayBuffer = new Uint8Array(buf.buffer).buffer;
      resolve(arrayBuffer);
    });
  });
};

export const fetchNodeImage = async (url: string): Promise<Image> => {
  return new Promise<Image>(async (resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = url;
  });
};
