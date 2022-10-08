import { Cancelable, RequestParameters, ResponseCallback } from "maplibre-gl";
import LruCache from 'lru-cache';
import { ReprojConfig, ReprojContext } from "./types";
import { getSourceTile } from "./request";
import { parseTileRequestParams } from "./params"
import { drawTile } from "./draw";

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
  const cache = new LruCache<string, Promise<HTMLImageElement>>({
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
  const request = parseTileRequestParams(ctx, reqParams.url);
  let isCanceled = false;

  Promise.resolve()
    .then(async () => {
      // Bail if canceled 
      if (isCanceled) return cb(null, null);

      // Get all source tiles required to reproject
      const tiles = await Promise.all(
        request.wgs84Tiles.map(tile => 
          getSourceTile(request.urlTemplate, tile, request.lngLatBbox, ctx.cache)
            .then(image => ({ tile, image }))
      ));

      // Bail if canceled or no tiles found
      if (isCanceled || !tiles?.length) return cb(null, null);

      // Create new tile image from source tiles
      const img = await drawTile(
        ctx.props.method,
        ctx.props.tileSize,
        tiles,
        request.mercatorBbox,
        request.lngLatBbox
      );

      cb(null, img);
    })
    .catch(err => {
      const error = err instanceof Error ? err : new Error(err);
      cb(error);
    });

  return { 
    cancel: () => {
      isCanceled = true
    }
  };
};
