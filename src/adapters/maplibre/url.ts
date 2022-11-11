import { Bbox, Tile } from "src/types";

export interface ParseCustomProtocolRequestUrlOutput {
  bbox: Bbox; 
  tile: Tile;
  urlTemplate: string;
  interval?: number[];
  sourceTileSize?: number;
  destinationTileSize?: number;
}

export const parseCustomProtocolRequestUrl = (url: string): ParseCustomProtocolRequestUrlOutput => {
  const [, reprojParamsStr, ...urlTemplates] = url.split(/:\/\//);
  const urlTemplate = urlTemplates.join('://');
  const reprojParams = new URLSearchParams(reprojParamsStr);
  const tile: Tile = [
    +(reprojParams.get('x') ?? 0),
    +(reprojParams.get('y') ?? 0),
    +(reprojParams.get('z') ?? 0),
  ];
  const bbox = (reprojParams.get('bbox') ?? '').split(',').map((d: string) => +d);
  const interval = (reprojParams.get('interval') ?? '').split(',').map((d: string) => +d);
  const tileSize = +(reprojParams.get('size') ?? 0);
  const sourceTileSize = +(reprojParams.get('ssize') ?? tileSize);
  const destinationTileSize = +(reprojParams.get('dsize') ?? tileSize);
  return { 
    bbox, 
    tile, 
    urlTemplate,
    interval: reprojParams.has('interval') ? interval : undefined,
    sourceTileSize: reprojParams.has('ssize') || reprojParams.has('size') ? sourceTileSize : undefined,
    destinationTileSize: reprojParams.has('dsize') || reprojParams.has('size') ? destinationTileSize : undefined,
  };
};
