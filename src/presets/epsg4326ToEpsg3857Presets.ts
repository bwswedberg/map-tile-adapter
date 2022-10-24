import * as tilebelt from 'tilebelt-wgs84';
import { Bbox, DestinationTileToSourceTilesFn, DestinationToPixelFn, DestinationToSourceFn, PixelToDestinationFn, SourceToPixelFn, Tile } from "../types";
import { WebMercator } from '../proj/WebMercator';

type Epsg4326ToEpsg3857PresetOptions = {
  zoomOffset: number;
}

const destinationToPixel: DestinationToPixelFn = ([x, y], zoom, tileSize) => {
  const proj = new WebMercator(tileSize);
  const p = proj.metersToPixels([x, y], zoom);
  return [
    p[0],
    (tileSize << zoom) - p[1] // transform y origin from bottom to top
  ];
}

const pixelToDestination: PixelToDestinationFn = ([x, y], zoom, tileSize) => {
  const proj = new WebMercator(tileSize);
  const p = [
    x,
    (tileSize << zoom) - y // transform y origin from top to bottom
  ]
  return proj.pixelsToMeters(p, zoom);
}

const destinationToSource: DestinationToSourceFn = ([x, y]) => {
  return WebMercator.metersToLngLat([x, y]);
}

const sourceToPixel: SourceToPixelFn = (lngLat, zoom, tileSize) => {
  const extent = tilebelt.getExtent(zoom);
  return [
    tilebelt.normalizeLng(lngLat[0]) * extent[0] * tileSize, 
    tilebelt.normalizeLat(lngLat[1]) * extent[1] * tileSize, 
  ];
};

const destinationTileToSourceTiles = (
  destinationRequest: { tile: Tile, bbox: Bbox },
  options: Epsg4326ToEpsg3857PresetOptions,
) => {
  const lngLatBbox = [
    ...(WebMercator.metersToLngLat([destinationRequest.bbox[0], destinationRequest.bbox[1]])),
    ...(WebMercator.metersToLngLat([destinationRequest.bbox[2], destinationRequest.bbox[3]])),
  ];
  const zoom = destinationRequest.tile[2];
  const sourceTiles: Tile[] = tilebelt.bboxToTiles(lngLatBbox, zoom + options.zoomOffset ?? 0);
  return sourceTiles.map(tile => {
    const bbox: Bbox = tilebelt.tileToBBox(tile);
    return { tile, bbox };
  });
};

const defaultOptions: Epsg4326ToEpsg3857PresetOptions = {
  zoomOffset: -1
};

export const epsg4326ToEpsg3857Presets = (
  options: Epsg4326ToEpsg3857PresetOptions = defaultOptions
): {
  destinationToPixel: DestinationToPixelFn;
  pixelToDestination: PixelToDestinationFn;
  destinationToSource: DestinationToSourceFn;
  sourceToPixel: SourceToPixelFn;
  destinationTileToSourceTiles: DestinationTileToSourceTilesFn;
} => ({
  destinationToPixel,
  pixelToDestination,
  destinationToSource,
  sourceToPixel,
  destinationTileToSourceTiles: (props) => destinationTileToSourceTiles(props, options),
});
