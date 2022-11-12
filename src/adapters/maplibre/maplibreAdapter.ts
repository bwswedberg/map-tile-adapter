import type { Cancelable, RequestParameters, ResponseCallback } from "maplibre-gl";
import type { MapTileAdapterContext, MapTileAdapterOptions } from "src/types";
import { canvasToArrayBuffer, fetchImage, TileCache } from "src/util";
import { loadTile } from "../core/coreAdapter";
import { parseCustomProtocolRequestUrl } from "./url";

const MTA_PROTOCOL = 'mta';

const loader = (
  ctx: MapTileAdapterContext, 
  reqParams: RequestParameters, 
  cb: ResponseCallback<ArrayBuffer>
): Cancelable => {
  const request = parseCustomProtocolRequestUrl(reqParams.url);
  const _ctx: MapTileAdapterContext = {
    ...ctx,
    sourceTileSize: request.sourceTileSize ?? ctx.sourceTileSize,
    destinationTileSize: request.destinationTileSize ?? ctx.destinationTileSize,
    interval: request.interval ?? ctx.interval,
  };

  let isCanceled = false;

  void loadTile({
    ctx: _ctx,
    url: request.urlTemplate,
    destinationRequest: { tile: request.tile, bbox: request.bbox },
    checkCanceled: () => isCanceled,
  })
  .then(async (destination) => {
    if (!destination) return cb(null, null);
    const img = await canvasToArrayBuffer(destination.canvas);
    cb(null, img);
  })
  .catch(error => cb(error));

  return { 
    cancel: () => {
      isCanceled = true
    }
  };
};

interface MaplibreTileAdapterOptions extends MapTileAdapterOptions {
  protocol?: string;
}

export const maplibreTileAdapterProtocol = (options: MaplibreTileAdapterOptions) => {
  const cache = new TileCache<HTMLImageElement | null>({
    fetchTile: url => fetchImage(url),
    maxCache: options.cacheSize ?? 10,
  });
  const destinationTileSize = options?.destinationTileSize ?? options?.tileSize ?? 256;
  const ctx: MapTileAdapterContext = { 
    cache,
    destinationTileSize,
    destinationTileToSourceTiles: options.destinationTileToSourceTiles,
    destinationToPixel: options.destinationToPixel,
    destinationToSource: options.destinationToSource,
    interval: options?.interval ?? [destinationTileSize, destinationTileSize],
    pixelToDestination: options.pixelToDestination,
    sourceTileSize: options?.sourceTileSize ?? destinationTileSize,
    sourceToPixel: options.sourceToPixel,
  };
  return {
    protocol: `${options?.protocol ?? MTA_PROTOCOL}`,
    tileUrlPrefix: `${options?.protocol ?? MTA_PROTOCOL}://bbox={bbox-epsg-3857}&z={z}&x={x}&y={y}`,
    loader: loader.bind(null, ctx),
  };
}
