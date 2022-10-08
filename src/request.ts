import { Bbox, ReprojSourceTileCache, Tile } from "./types";

export const getSourceTile = async (
  urlTemplate: string,
  tile: Tile,
  lngLatBbox: Bbox,
  cache: ReprojSourceTileCache
): Promise<HTMLImageElement> => {
  const url = urlTemplate
    .replace('{bbox-epsg-4326}', `${lngLatBbox.join(',')}`)
    .replace('{x-epsg-4326}', `${tile[0]}`)
    .replace('{y-epsg-4326}', `${tile[1]}`)
    .replace('{z-epsg-4326}', `${tile[2]}`);
  const cachedPromise = cache.get(url);
  if (cachedPromise) return cachedPromise;
  const tilePromise = new Promise<HTMLImageElement>(async (resolve, reject) => {
    try {
      const image = new Image();
      image.crossOrigin = '';
      image.src = url;
      await image.decode()
      resolve(image);
    } catch (error) {
      reject(error);
    }
  });
  cache.set(url, tilePromise);
  return tilePromise;
};