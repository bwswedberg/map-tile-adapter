import type LruCache from 'lru-cache';

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

export type ReprojRequest = {
  mercatorTile: Tile;
  mercatorBbox: Bbox;
  wgs84Tiles: Tile[];
  lngLatBbox: Bbox;
  urlTemplate: string;
};

export type ReprojSourceTileCache = LruCache<string, Promise<HTMLImageElement>>

export type ReprojContext = {
  props: {
    protocol: string;
    tileSize: number;
    zoomOffset: number;
    precision: number;
    method: 'splice' | 'resample';
    cacheSize: number;
  };
  cache: ReprojSourceTileCache;
};

export type ReprojectionMethod = (
  tileSize: number,
  sources: { tile: Tile, image: HTMLImageElement }[],
  mercatorBbox: Bbox,
  lngLatBbox: Bbox
) => Promise<ArrayBuffer | null>
