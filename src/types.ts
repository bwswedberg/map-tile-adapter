import { TileCache } from './util/cache';

/**
 * [x, y, z]
 */
export type Tile = number[] | [number, number, number];

/**
 * [xmin, ymin, xmax, ymax]
 */
export type Bbox = number[] | [number, number, number, number];

export type DestinationToPixelFn = ([dx, dy]: number[], zoom: number, tileSize: number) => number[];
export type PixelToDestinationFn = ([px, py]: number[], zoom: number, tileSize: number) => number[];
export type DestinationToSourceFn = ([dx, dy]: number[]) => number[];
export type SourceToPixelFn = ([sx, sy]: number[], zoom: number, tileSize: number) => number[];
export type DestinationTileToSourceTilesFn = (props: { tile: Tile, bbox: Bbox }) => { tile: Tile, bbox: Bbox }[];

export interface MapTileAdapterOptions {
  cacheSize?: number;
  destinationTileSize?: number;
  destinationTileToSourceTiles: DestinationTileToSourceTilesFn;
  destinationToPixel: DestinationToPixelFn;
  destinationToSource: DestinationToSourceFn;
  interval?: number[];
  pixelToDestination: PixelToDestinationFn;
  sourceTileSize?: number;
  sourceToPixel: SourceToPixelFn;
  tileSize?: number;
}

export type AbstrctCanvasRenderingContext2D = {
  canvas: any;
  drawImage(source: any, sx: number, sy: number): void;
  drawImage(source: any, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
}

export interface MapTileAdapterContext<TContext extends AbstrctCanvasRenderingContext2D = AbstrctCanvasRenderingContext2D, TImage = any> {
  cache: TileCache<TImage | null>;
  destinationTileSize: number;
  destinationTileToSourceTiles: DestinationTileToSourceTilesFn;
  destinationToPixel: DestinationToPixelFn;
  destinationToSource: DestinationToSourceFn;
  interval: number[];
  pixelToDestination: PixelToDestinationFn;
  sourceTileSize: number;
  sourceToPixel: SourceToPixelFn;
  createCanvasRenderingContext2D: (width: number, height: number) => TContext
}
