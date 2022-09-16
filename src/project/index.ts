import { ReprojectionMethod } from "../types";
import { resampleTiles } from "./resample";
import { spliceTiles } from "./splice";

export const reprojectTiles: ReprojectionMethod = async (ctx, req, sources) => {
  if (ctx.props.method === 'resample') {
    return await resampleTiles(ctx, req, sources);
  }
  return await spliceTiles(ctx, req, sources);
}

export { mercatorToLngLat } from './common';
