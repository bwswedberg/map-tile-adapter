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
