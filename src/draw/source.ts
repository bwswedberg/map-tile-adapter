import * as tilebelt from 'tilebelt-wgs84';
import { Tile } from "../types";
import { createCanvasContext } from './common';

export const drawSource = (
  sources: { tile: Tile, image: HTMLImageElement }[], 
  tileSize: number,
) => {
  // Find source tile bbox
  const tileBbox = [
    Math.min(...sources.map(d => d.tile[0])),
    Math.min(...sources.map(d => d.tile[1])),
    Math.max(...sources.map(d => d.tile[0])),
    Math.max(...sources.map(d => d.tile[1])),
  ];

  // Calculate wgs84 canvas offset since wgs canvas origin is the top left source tile
  const pixelOffset = [
    tileBbox[0] * tileSize,
    tileBbox[1] * tileSize
  ];

  // Create canvas using source tiles in wgs84. Canvas size fits source tile bbox
  const ctx = createCanvasContext(
    (tileBbox[2] - tileBbox[0] + 1) * tileSize, // width
    (tileBbox[3] - tileBbox[1] + 1) * tileSize // height
  );

  // Create working canvas to access fetched images
  for (const { tile, image } of sources) {
    ctx.drawImage(
      image, 
      tile[0] * tileSize - pixelOffset[0], // sx
      tile[1] * tileSize - pixelOffset[1] // sy
    );
  }

  // Get tile zoom level using first tile
  const tileZoom = sources[0].tile[2]; 

  // The total amount of tiles globally at that zoom level
  const [pixelWidth, pixelHeight] = tilebelt.getExtent(tileZoom).map(d => d * tileSize);

  // Projects lngLat to canvas pixel coordinate
  const lngLatToPixel = (lngLat: number[]) => [
    tilebelt.normalizeLng(lngLat[0]) * pixelWidth - pixelOffset[0],
    tilebelt.normalizeLat(lngLat[1]) * pixelHeight - pixelOffset[1]
  ];
  
  return { canvas: ctx.canvas, lngLatToPixel };
};
