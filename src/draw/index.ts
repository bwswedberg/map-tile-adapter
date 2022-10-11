import { Bbox, Tile } from "../types";
import { drawDestination } from "./destination";

export const drawTile = async (
  sources: { tile: Tile, image: HTMLImageElement }[],
  mercatorBbox: Bbox,
  tileSize: number,
  resamplingInterval: number[]
) => {
  return await drawDestination(sources, mercatorBbox, tileSize, resamplingInterval);
}
