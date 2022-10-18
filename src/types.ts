import { SourceTileCache } from './sourceTileCache';

/**
 * [x, y, z]
 */
export type Tile = number[] | [number, number, number];

/**
 * [xmin, ymin, xmax, ymax]
 */
export type Bbox = number[] | [number, number, number, number];

export interface ReprojTransform {
  destinationToPixel: ([dx, dy]: number[], ctx: { zoom: number, tileSize: number }) => number[];
  pixelToDestination: ([px, py]: number[], ctx: { zoom: number, tileSize: number }) => number[];
  destinationToSource: ([dx, dy]: number[]) => number[];
  sourceToPixel: ([sx, sy]: number[], ctx: { zoom: number, tileSize: number }) => number[];
  destinationTileToSourceTiles: (props: { tile: Tile, bbox: Bbox, urlTemplate: string }) => { tile: Tile, bbox: Bbox, url: string }[];
}

export interface ReprojOptions {
  tileSize: number;
  resamplingInterval: number[];
  cacheSize: number;
  transform: ReprojTransform;
}

export type ReprojContext = {
  tileSize: number;
  resamplingInterval: number[];
  cache: SourceTileCache<HTMLImageElement | null>;
  transform: ReprojTransform;
};
