import * as tilebelt from 'tilebelt-wgs84'
import { ReprojContext, ReprojRequest, Tile } from "./types";
import { mercatorBboxToLngLatBbox } from './proj';

export const parseTileRequestParams = (
  ctx: ReprojContext, 
  url: string,
): ReprojRequest => {
  const [_, reprojParamsStr, ...urlTemplates] = url.split(/:\/\//);
  const urlTemplate = urlTemplates.join('://');
  const reprojParams = new URLSearchParams(reprojParamsStr);
  const mercatorTile: Tile = [
    +(reprojParams.get('x') ?? 0),
    +(reprojParams.get('y') ?? 0),
    +(reprojParams.get('z') ?? 0),
  ];
  const mercatorBbox = (reprojParams.get('bbox') ?? '').split(',').map((d: string) => +d);
  const lngLatBbox = mercatorBboxToLngLatBbox(mercatorBbox);
  const wgs84Tiles = tilebelt.bboxToTiles(lngLatBbox, mercatorTile[2] + ctx.props.zoomOffset);
  console.log(wgs84Tiles.length)
  return {
    mercatorTile,
    mercatorBbox,
    wgs84Tiles,
    lngLatBbox,
    urlTemplate,
  };
};
