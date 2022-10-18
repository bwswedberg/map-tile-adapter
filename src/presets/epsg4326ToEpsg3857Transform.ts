import * as tilebelt from 'tilebelt-wgs84';
import { Bbox, Tile } from "../types";
import { getImageUrl } from "../util";
import { WebMercator } from './common/WebMercator';

type Epsg4326ToEpsg3857PresetOptions = {
  zoomOffset: number;
}

const destinationToPixel = ([x, y]: number[], ctx: { zoom: number, tileSize: number } ) => {
  const proj = new WebMercator(ctx.tileSize);
  const p = proj.metersToPixels([x, y], ctx.zoom);
  return [
    p[0],
    (ctx.tileSize << ctx.zoom) - p[1] // transform y origin from bottom to top
  ];
}

const pixelToDestination = ([x, y]: number[], ctx: { zoom: number, tileSize: number } ) => {
  const proj = new WebMercator(ctx.tileSize);
  const p = [
    x,
    (ctx.tileSize << ctx.zoom) - y // transform y origin from top to bottom
  ]
  return proj.pixelsToMeters(p, ctx.zoom);
}

const destinationToSource = ([x, y]: number[]) => {
  return WebMercator.metersToLngLat([x, y]);
}

const sourceToPixel = (lngLat: number[], ctx: { zoom: number, tileSize: number }) => {
  const extent = tilebelt.getExtent(ctx.zoom);
  return [
    tilebelt.normalizeLng(lngLat[0]) * extent[0] * ctx.tileSize, 
    tilebelt.normalizeLat(lngLat[1]) * extent[1] * ctx.tileSize, 
  ];
};

const destinationTileToSourceTiles = (
  options: Epsg4326ToEpsg3857PresetOptions,
  props: { tile: Tile, bbox: Bbox, urlTemplate: string }
) => {
  const lngLatBbox = [
    ...(WebMercator.metersToLngLat([props.bbox[0], props.bbox[1]])),
    ...(WebMercator.metersToLngLat([props.bbox[2], props.bbox[3]])),
  ];
  const wgs84Tiles: Tile[] = tilebelt.bboxToTiles(lngLatBbox, props.tile[2] + options.zoomOffset ?? 0);

  return wgs84Tiles.map(tile => {
    const bbox: Bbox = tilebelt.tileToBBox(tile);
    const url = getImageUrl(props.urlTemplate, tile, bbox);
    return { tile, bbox, url };
  });
};

const defaultOptions: Epsg4326ToEpsg3857PresetOptions = {
  zoomOffset: -1
};

export const epsg4326ToEpsg3857Transform = (options: Epsg4326ToEpsg3857PresetOptions = defaultOptions) => ({
  destinationToPixel,
  pixelToDestination,
  destinationToSource,
  sourceToPixel,
  destinationTileToSourceTiles: destinationTileToSourceTiles.bind(null, options),
});
