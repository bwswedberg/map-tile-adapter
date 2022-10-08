import { Bbox, Tile } from "../types";
import { resampleTiles } from "./resample";
import { spliceTiles } from "./splice";

export const drawTile = async (
  method: string,
  tileSize: number,
  sources: { tile: Tile, image: HTMLImageElement }[],
  mercatorBbox: Bbox,
  lngLatBbox: Bbox
) => {
  if (method === 'resample') {
    return await resampleTiles(tileSize, sources, mercatorBbox, lngLatBbox);
  }
  return await spliceTiles(tileSize, sources, mercatorBbox, lngLatBbox);
}
