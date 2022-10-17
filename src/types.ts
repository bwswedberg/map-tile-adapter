import { SourceTileCache } from './sourceTileCache';

/**
 * [x, y, z]
 */
export type Tile = number[] | [number, number, number];

/**
 * [xmin, ymin, xmax, ymax]
 */
export type Bbox = number[] | [number, number, number, number];

export interface ReprojConfig {
  protocol: string;
  tileSize: number;
  zoomOffset: number;
  resamplingInterval: number[];
  cacheSize: number;
}

export type ReprojRequest = {
  mercatorTile: Tile;
  mercatorBbox: Bbox;
  sources: { 
    tile: Tile;
    bbox: Bbox;
    url: string;
    image: HTMLImageElement | null;
  }[];
  lngLatBbox: Bbox;
  urlTemplate: string;
};

export type ReprojContext = {
  props: ReprojConfig;
  cache: SourceTileCache<HTMLImageElement | null>;
};

export interface ReprojTransform {
  pixelToDestination: (point: number[], ctx: { bbox: Bbox, width: number, height: number }) => number[];
  destinationToSource: (point: number[]) => number[];
  sourceToPixel: (point: number[], ctx: { bbox: Bbox, width: number, height: number }) => number[];
  destinationTileToSourceTiles: (props: { tile: Tile, bbox: Bbox, urlTemplate: string }) => { tile: Tile, bbox: Bbox, url: string }[];
}

export interface ReprojTransform2 {
  destinationToPixel: (point: number[], ctx: { zoom: number, tileSize: number }) => number[];
  pixelToDestination: (point: number[], ctx: { zoom: number, tileSize: number }) => number[];
  destinationToSource: (point: number[]) => number[];
  sourceToPixel: (point: number[], ctx: { zoom: number, tileSize: number }) => number[];
  destinationTileToSourceTiles: (props: { tile: Tile, bbox: Bbox, urlTemplate: string }) => { tile: Tile, bbox: Bbox, url: string }[];
}

export interface ReprojOptions {
  tileSize: number;
  resamplingInterval: number[];
  cacheSize: number;
  transform: ReprojTransform2;
}

export type ReprojContext2 = {
  tileSize: number;
  resamplingInterval: number[];
  cache: SourceTileCache<HTMLImageElement | null>;
  transform: ReprojTransform2;
};
