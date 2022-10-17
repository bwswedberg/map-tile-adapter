import * as tilebelt from 'tilebelt-wgs84';
import proj4 from 'proj4';
import { Bbox, Tile } from "../types";
import { getImageUrl } from "../util";

type Epsg4326ToEpsg3857PresetOptions = {
  zoomOffset: number;
}

const mercatorProj = proj4('EPSG:3857', 'EPSG:4326');

const mercatorToLngLat = (lngLat: number[]) => mercatorProj.forward(lngLat);

const pixelToDestination = ([x, y]: number[], ctx: { zoom: number, bbox: Bbox, width: number, height: number } ) => {
  return [
    (ctx.bbox[2] - ctx.bbox[0]) * (x / ctx.width) + ctx.bbox[0],
    (ctx.bbox[3] - ctx.bbox[1]) * (1 - y / ctx.height) + ctx.bbox[1], // y is inverse
  ];
}
const destinationToSource = ([x, y]: number[]) => {
  return mercatorToLngLat([x, y]);
}

const sourceToPixel = (lngLat: number[], ctx: { zoom: number, bbox: Bbox, width: number, height: number }) => {
  const bbox = [
    tilebelt.normalizeLng(ctx.bbox[0]),
    tilebelt.normalizeLat(ctx.bbox[3]), // y is inverse
    tilebelt.normalizeLng(ctx.bbox[2]),
    tilebelt.normalizeLat(ctx.bbox[1]), // y is inverse
  ];

  const point = [
    tilebelt.normalizeLng(lngLat[0]),
    tilebelt.normalizeLat(lngLat[1]),
  ];

  return [
    ((point[0] - bbox[0]) / (bbox[2] - bbox[0])) * ctx.width,
    ((point[1] - bbox[1]) / (bbox[3] - bbox[1])) * ctx.height,
  ];
};

const destinationTileToSourceTiles = (
  options: Epsg4326ToEpsg3857PresetOptions,
  props: { tile: Tile, bbox: Bbox, urlTemplate: string }
) => {
  const lngLatBbox = [
    ...(mercatorToLngLat([props.bbox[0], props.bbox[1]])),
    ...(mercatorToLngLat([props.bbox[2], props.bbox[3]])),
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
  pixelToDestination,
  destinationToSource,
  sourceToPixel,
  destinationTileToSourceTiles: destinationTileToSourceTiles.bind(null, options),
});
