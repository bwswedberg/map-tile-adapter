import * as tilebelt from 'tilebelt-wgs84'
import { ReprojContext, ReprojRequest, Tile } from "./types";
import { mercatorToLngLat } from './project';

export const createReprojRequest = (
  ctx: ReprojContext, 
  url: string,
): ReprojRequest => {
  const [_, reprojParamsStr, ...urlTemplates] = url.split(/:\/\//);
  const urlTemplate = urlTemplates.join('://');
  const reprojParams = new URLSearchParams(reprojParamsStr);
  const mercatorTile: Tile = [
    +(reprojParams.get('x') ?? 0),
    +(reprojParams.get('y') ?? 0),
    +(reprojParams.get('z') ?? 0),
  ];
  const mercatorBbox = (reprojParams.get('bbox') ?? '').split(',').map((d: string) => +d);
  const lngLatBbox = [
    ...(mercatorToLngLat([mercatorBbox[0], mercatorBbox[1]])),
    ...(mercatorToLngLat([mercatorBbox[2], mercatorBbox[3]])),
  ].map(d => Math.round(d / ctx.props.precision) * ctx.props.precision);
  const wgs84Tiles = tilebelt.bboxToTiles(lngLatBbox, mercatorTile[2] + ctx.props.zoomOffset);
  return {
    mercatorTile,
    mercatorBbox,
    wgs84Tiles,
    lngLatBbox,
    urlTemplate,
  };
};

export const fetchTiles = async (
  ctx: ReprojContext,
  request: ReprojRequest,
): Promise<{ tile: Tile, image: HTMLImageElement }[]> => {
  const requests = request.wgs84Tiles.map(tile => {
    const url = request.urlTemplate
      .replace('{bbox-epsg-4326}', `${request.lngLatBbox.join(',')}`)
      .replace('{x-epsg-4326}', `${tile[0]}`)
      .replace('{y-epsg-4326}', `${tile[1]}`)
      .replace('{z-epsg-4326}', `${tile[2]}`);
    const cachedPromise = ctx.cache.get(url);
    if (cachedPromise) return cachedPromise;
    const tilePromise = new Promise<{ tile: Tile, image: HTMLImageElement }>(async (resolve, reject) => {
      try {
        const image = new Image();
        image.src = url;
        image.crossOrigin = '';
        await image.decode()
        resolve({ tile, image });
      } catch (error) {
        reject(error);
      }
    });
    ctx.cache.set(url, tilePromise);
    return tilePromise;
  });
  return await Promise.all(requests);
};