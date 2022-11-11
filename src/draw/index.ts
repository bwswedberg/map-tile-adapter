import { AbstrctCanvasRenderingContext2D, Bbox, MapTileAdapterContext, Tile } from 'src/types';
import { drawDestination } from './destination';
import { drawSource } from './source';

export const drawTile = <TContext extends AbstrctCanvasRenderingContext2D, TImage = any>(
  ctx: MapTileAdapterContext<TContext, TImage>,
  sources: { tile: Tile, image: TImage | null, bbox: Bbox }[], 
  destinationRequest: { tile: Tile, bbox: Bbox },
) => {
  // Create new tile image from source tiles
  const source = drawSource<TContext, TImage>(ctx, sources);

  // Use source canvs to render destination canvas
  return drawDestination<TContext, TImage>(ctx, source, destinationRequest);
}