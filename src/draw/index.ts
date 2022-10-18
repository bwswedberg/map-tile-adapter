import { Bbox, ReprojContext, Tile } from "../types";
import { drawDestination } from "./destination";
import { drawSourceCanvas } from "./source";

export const drawTile = (
  ctx: ReprojContext,
  sources: { tile: Tile, image: HTMLImageElement, bbox: Bbox }[],
  destination: { tile: Tile, bbox: Bbox },
) => {
  const source = drawSourceCanvas(sources, ctx.tileSize, ctx.transform);
  return drawDestination(ctx, source, destination);
};
