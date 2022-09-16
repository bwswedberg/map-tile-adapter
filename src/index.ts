import { Cancelable, RequestParameters, ResponseCallback } from "maplibre-gl";
import LruCache from 'lru-cache';
import { ReprojConfig, ReprojContext, Tile } from "./types";
import { createReprojRequest, fetchTiles } from "./request";
import { reprojectTiles } from "./project";

export const REPROJECTED_PROTOCOL = 'reprj';

const defaultConfig: ReprojConfig = {
  protocol: REPROJECTED_PROTOCOL,
  tileSize: 256,
  zoomOffset: -1,
  precision: 0.000001,
  method: 'resample',
  cacheSize: 10,
};

export const reprojectedProtocol = (config: Partial<ReprojConfig> = {}) => {
  const props: ReprojContext['props'] = {
    ...defaultConfig,
    ...config
  };
  const cache = new LruCache<string, Promise<{ tile: Tile, image: HTMLImageElement }>>({
    max: props.cacheSize,
  });
  const ctx: ReprojContext = { props, cache };
  return loadFn.bind(null, ctx);
}

const loadFn = (
  ctx: ReprojContext, 
  reqParams: RequestParameters, 
  cb: ResponseCallback<any>
): Cancelable => {
  const request = createReprojRequest(ctx, reqParams.url);
  let isCanceled = false;
  Promise.resolve()
    .then(async () => {
      if (isCanceled) return cb(null, null);
      const tiles = await fetchTiles(ctx, request);
      if (isCanceled) return cb(null, null);
      if (!tiles?.length) return cb(null, null);
      const img = await reprojectTiles(ctx, request, tiles);
      cb(null, img);
    })
    .catch(err => {
      const error = err instanceof Error ? err : new Error(err);
      cb(error);
    });
  const cancel = () => {
    isCanceled = true;
  };
  return { cancel };
};
