import LruCache from 'lru-cache';

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
  precision: number;
  method: 'splice' | 'resample';
  cacheSize: number 
}

// export interface ReprojectedProtocolContext {
//   mercatorTile: Tile;
//   mercatorBbox: Bbox;
//   wgs84Tiles: Tile[];
//   lngLatBbox: Bbox;
//   urlTemplate: string;
//   config: ReprojectedProtocolConfig;
// }

export type ReprojRequest = {
  mercatorTile: Tile;
  mercatorBbox: Bbox;
  wgs84Tiles: Tile[];
  lngLatBbox: Bbox;
  urlTemplate: string;
};

export type ReprojContext = {
  props: {
    protocol: string;
    tileSize: number;
    zoomOffset: number;
    precision: number;
    method: 'splice' | 'resample';
    cacheSize: number;
  };
  cache: LruCache<string, Promise<{ tile: Tile, image: HTMLImageElement }>>;
};

export type ReprojectionMethod = (
  ctx: ReprojContext, 
  request: ReprojRequest,
  sources: { tile: Tile, image: HTMLImageElement }[]
) => Promise<ArrayBuffer | null>
