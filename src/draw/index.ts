import { Bbox, Tile } from "../types";
import { resampleTiles } from "./resample2";
import { spliceTiles } from "./splice";

export const drawTile = async (
  method: string,
  tileSize: number,
  sources: { tile: Tile, image: HTMLImageElement }[],
  mercatorBbox: Bbox
) => {
  if (method === 'resample') {
    return await resampleTiles(tileSize, sources, mercatorBbox);
  }
  return await spliceTiles(tileSize, sources, mercatorBbox);
}
