import { drawTile } from "src/draw";
import { AbstrctCanvasRenderingContext2D, Bbox, MapTileAdapterContext, Tile } from "src/types";
import { getImageUrl } from "src/util";

interface Props<TContext extends AbstrctCanvasRenderingContext2D, TImage = any> {
  ctx: MapTileAdapterContext<TContext, TImage>;
  url: string;
  destinationRequest: { tile: Tile, bbox: Bbox };
}

export const loadTile = <TContext extends AbstrctCanvasRenderingContext2D, TImage = any>({ 
  ctx,
  url,
  destinationRequest,
}: Props<TContext, TImage>): {
  promise: Promise<{ canvas: TContext['canvas'], translate: number[], zoom: number } | null>,
  cancel: () => void;
} => {
  let hasCanceled = false;

  const cancel = () => {
    hasCanceled = true;
  };

  const sourceRequests = ctx.destinationTileToSourceTiles({ 
    bbox: destinationRequest.bbox, 
    tile: destinationRequest.tile,
  }).map(d => ({
    ...d,
    url: getImageUrl(url, d.tile, d.bbox)
  }))

  // Fetch all source tiles required to reproject
  const promise = Promise.all(
      sourceRequests.map(async source => {
        if (hasCanceled) return { ...source, image: null };
        const image = await ctx.cache.getTile(source.url)
          .catch(() => null);
        return { ...source, image };
      })
    )
    .then((sources) => {
      const _sources = sources.filter((source) => source?.image);

      // Validate sources before continue
      // - Bail when no remaining sources
      // - Bail when canceled after async source tile fetching
      if (!_sources?.length || hasCanceled) return null;

      // Reproject source tiles to destination tile
      return drawTile(ctx, _sources, destinationRequest);
    });

  return { promise, cancel };
}