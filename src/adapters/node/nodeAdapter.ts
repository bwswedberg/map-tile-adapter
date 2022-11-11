import type { Image, CanvasRenderingContext2D, Canvas } from "canvas";
import { Bbox, MapTileAdapterContext, MapTileAdapterOptions, Tile } from "src/types";
import { TileCache } from "src/util/cache";
import { nodeCanvasToArrayBuffer, fetchNodeImage, createNodeCanvasContext } from "src/util/node";
import { loadTile } from "../core";

type NodeMapTileAdapterContext = MapTileAdapterContext<CanvasRenderingContext2D, Image>

interface NodeMapTileRequest {
  url: string;
  tile: Tile;
  bbox: Bbox;
  options?: {
    interval?: number[];
    sourceTileSize?: number;
    destinationTileSize?: number;
  };
}

const loader = async (
  ctx: NodeMapTileAdapterContext, 
  req: NodeMapTileRequest,
): Promise<ArrayBuffer | null> => {
  const _ctx: NodeMapTileAdapterContext = {
    ...ctx,
    sourceTileSize: req.options?.sourceTileSize ?? ctx.sourceTileSize,
    destinationTileSize: req.options?.destinationTileSize ?? ctx.destinationTileSize,
    interval: req.options?.interval ?? ctx.interval,
  };

  const { promise } = loadTile({
    ctx: _ctx,
    url: req.url,
    destinationRequest: { tile: req.tile, bbox: req.bbox },
  });

  return promise.then(async (destination) => {
    if (!destination) return null;
    const img = await nodeCanvasToArrayBuffer(destination.canvas as unknown as Canvas);
    return img;
  });
};

type NodeMapTileAdapterOptions = MapTileAdapterOptions;

export const nodeMapTileAdapter = (options: NodeMapTileAdapterOptions) => {
  const cache = new TileCache<Image | null>({
    fetchTile: url => fetchNodeImage(url),
    maxCache: options.cacheSize ?? 10,
  });
  const destinationTileSize = options?.destinationTileSize ?? options?.tileSize ?? 256;
  const ctx: NodeMapTileAdapterContext = { 
    cache,
    destinationTileSize,
    destinationTileToSourceTiles: options.destinationTileToSourceTiles,
    destinationToPixel: options.destinationToPixel,
    destinationToSource: options.destinationToSource,
    interval: options?.interval ?? [destinationTileSize, destinationTileSize],
    pixelToDestination: options.pixelToDestination,
    sourceTileSize: options?.sourceTileSize ?? destinationTileSize,
    sourceToPixel: options.sourceToPixel,
    createCanvasRenderingContext2D: (width: number, height: number) => {
      return createNodeCanvasContext(width, height);
    }
  };
  return {
    loader: loader.bind(null, ctx),
  };
};