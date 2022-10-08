export const createCanvasContext = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
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
