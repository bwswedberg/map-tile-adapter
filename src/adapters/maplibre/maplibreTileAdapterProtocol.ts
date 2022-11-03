import type { Cancelable, RequestParameters, ResponseCallback } from "maplibre-gl";
import type { MapTileAdapterContext, MapTileAdapterOptions } from "src/types";
import { canvasToArrayBuffer, fetchImage, TileCache } from "src/util";
import { loadTile } from "../base";
import { parseUrl, getImageUrl } from "./url";

const MTA_PROTOCOL = 'mta';

const loader = (
  ctx: MapTileAdapterContext, 
  reqParams: RequestParameters, 
  cb: ResponseCallback<ArrayBuffer>
): Cancelable => {
  const request = parseUrl(reqParams.url);
  
  const sourceRequests = ctx.destinationTileToSourceTiles({ 
    bbox: request.bbox, 
    tile: request.tile,
  }).map(d => ({
    ...d,
    url: getImageUrl(request.urlTemplate, d.tile, d.bbox)
  }));

  let isCanceled = false;

  void loadTile({
    ctx,
    sourceRequests,
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
  const destinationTileSize = options?.destinationTileSize ?? options?.sourceTileSize ?? 256
  const ctx: MapTileAdapterContext = { 
    cache,
    destinationTileSize: options?.destinationTileSize ?? options?.sourceTileSize ?? 256,
    destinationTileToSourceTiles: options.destinationTileToSourceTiles,
    destinationToPixel: options.destinationToPixel,
    destinationToSource: options.destinationToSource,
    interval: options?.interval ?? [destinationTileSize, destinationTileSize],
    pixelToDestination: options.pixelToDestination,
    sourceTileSize: options?.sourceTileSize ?? options?.destinationTileSize ?? 256,
    sourceToPixel: options.sourceToPixel,
  };
  return {
    protocol: `${options?.protocol ?? MTA_PROTOCOL}`, // ://bbox={bbox-epsg-3857}&z={z}&x={x}&y={y}`,
    tileUrlPrefix: `${options?.protocol ?? MTA_PROTOCOL}://bbox={bbox-epsg-3857}&z={z}&x={x}&y={y}`,
    loader: loader.bind(null, ctx),
  };
}
