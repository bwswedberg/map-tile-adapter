import { drawTile } from "../../draw";
import type { Bbox, MapTileAdapterContext, Tile } from "../../types";
import { getImageUrl } from "src/util";

interface Props {
  ctx: MapTileAdapterContext;
  url: string;
  destinationRequest: { tile: Tile, bbox: Bbox };
  checkCanceled: () => boolean,
}

export const loadTile = async ({ 
  ctx,
  url,
  destinationRequest,
  checkCanceled
}: Props): Promise<{ canvas: HTMLCanvasElement, translate: number[], zoom: number } | null> => {
  // Bail when already canceled 
  if (checkCanceled()) return null;

  const sourceRequests = ctx.destinationTileToSourceTiles({ 
    bbox: destinationRequest.bbox, 
    tile: destinationRequest.tile,
  }).map(d => ({
    ...d,
    url: getImageUrl(url, d.tile, d.bbox)
  }));

  // Fetch all source tiles required to reproject
  let sources = await Promise.all(
    sourceRequests.map(async source => {
      const image = await ctx.cache.getTile(source.url)
        .catch(() => null);
      return { ...source, image };
    })
  );

  // Return all sources with an image
  sources = sources.filter(source => source.image);

  // Validate sources before continue
  // - Bail when no remaining sources
  // - Bail when canceled after async source tile fetching
  if (!sources?.length || checkCanceled()) return null;

  // Reproject source tiles to destination tile
  return drawTile(ctx, sources, destinationRequest);
}

interface PropsWithCancel {
  ctx: MapTileAdapterContext;
  url: string;
  destinationRequest: { tile: Tile, bbox: Bbox };
}

export const loadTileWithCancel = ({ 
  ctx,
  url,
  destinationRequest
}: PropsWithCancel): {
  cancel: () => void,
  promise: Promise<{ canvas: HTMLCanvasElement, translate: number[], zoom: number } | null>
} => {
  let isCanceled = false;

  const cancel = () => {
    isCanceled = true;
  };

  const sourceRequests = ctx.destinationTileToSourceTiles({ 
    bbox: destinationRequest.bbox, 
    tile: destinationRequest.tile,
  }).map(d => ({
    ...d,
    url: getImageUrl(url, d.tile, d.bbox)
  }));

  // Fetch all source tiles required to reproject
  const promise = Promise.all(
    sourceRequests.map(async source => {
      if (isCanceled) return { ...source, image: null };
      const image = await ctx.cache.getTile(source.url).catch(() => null);
      return { ...source, image };
    })
  ).then((sources) => {
    if (isCanceled) return null;

    // Return all sources with an image
    const _sources = sources.filter(source => source.image);

    // Validate sources before continue
    // - Bail when no remaining sources
    // - Bail when canceled after async source tile fetching
    if (!_sources?.length) return null;

    // Reproject source tiles to destination tile
    return drawTile(ctx, _sources, destinationRequest);
  });

  return { cancel, promise };
}