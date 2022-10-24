import { drawSource, drawDestination } from "../draw";
import { Bbox, MapTileAdapterContext, Tile } from "../types";

interface Props {
  ctx: MapTileAdapterContext;
  destinationRequest: { tile: Tile, bbox: Bbox };
  sourceRequests: { tile: Tile; bbox: Bbox; url: string }[];
  checkCanceled: () => boolean,
}

export const loadTile = async ({ 
  ctx,
  destinationRequest,
  sourceRequests,
  checkCanceled
}: Props): Promise<{ canvas: HTMLCanvasElement } | null> => {
  try {
    // Bail if canceled 
    if (checkCanceled()) return null;

    // Get all source tiles required to reproject
    const sources = await Promise.all(
      sourceRequests.map(async source => {
        const image = await ctx.cache.getTile(source.url);
        return { ...source, image };
      })
    );

    if (sources.some(d => !d.image)) return null;

    // Bail if canceled or no tiles found
    if (checkCanceled() || !sources?.length) return null

    // Create new tile image from source tiles
    const source = drawSource(ctx, sources);

    return drawDestination(ctx, source, destinationRequest);
  } catch (err) {
    const error = err instanceof Error ? err 
      : typeof err === 'string' ? new Error(err)
      : new Error(`${err}`);
    throw error;
  }
}