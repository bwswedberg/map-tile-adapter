import type { Cancelable, RequestParameters, ResponseCallback } from "maplibre-gl";
import { ReprojContext, ReprojOptions, Tile } from "../types";
import { SourceTileCache } from "../sourceTileCache";
import { fetchImage, getImageUrl } from "../util";
import { loadTile } from "./base";

export const REPROJECTED_PROTOCOL = 'reprj';

interface MaplibreAdapterOptions extends ReprojOptions {
  protocol: string;
}

export const reprojectedProtocol = (options: MaplibreAdapterOptions) => {
  const cache = new SourceTileCache<HTMLImageElement | null>({
    fetchItem: item => fetchImage(item),
    maxCache: options.cacheSize ?? 10,
  });
  const tileSize = options.tileSize ?? 256;
  const ctx: ReprojContext = { 
    cache,
    tileSize,
    resamplingInterval: options.resamplingInterval ?? [tileSize, tileSize],
    transform: options.transform,
  };
  return loader.bind(null, ctx);
}

export const parseUrl = (url: string) => {
  const [_, reprojParamsStr, ...urlTemplates] = url.split(/:\/\//);
  const urlTemplate = urlTemplates.join('://');
  const reprojParams = new URLSearchParams(reprojParamsStr);
  const tile: Tile = [
    +(reprojParams.get('x') ?? 0),
    +(reprojParams.get('y') ?? 0),
    +(reprojParams.get('z') ?? 0),
  ];
  const bbox = (reprojParams.get('bbox') ?? '').split(',').map((d: string) => +d);
  return { bbox, tile, urlTemplate };
};

const loader = (
  ctx: ReprojContext, 
  reqParams: RequestParameters, 
  cb: ResponseCallback<any>
): Cancelable => {
  const request = parseUrl(reqParams.url);
  const sourceRequests = ctx.transform.destinationTileToSourceTiles({ 
    bbox: request.bbox, 
    tile: request.tile,
    urlTemplate: request.urlTemplate,
  });

  let isCanceled = false;

  void loadTile({
    ctx,
    sourceRequests,
    destination: { tile: request.tile, bbox: request.bbox },
    checkCanceled: () => isCanceled,
  })
  .then(img => cb(null, img))
  .catch(error => cb(error));

  return { 
    cancel: () => {
      isCanceled = true
    }
  };
};
