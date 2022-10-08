import proj4 from 'proj4';
import { Bbox } from './types';

const mercatorProj = proj4('EPSG:3857', 'EPSG:4326');

export const mercatorToLngLat = (lngLat: number[]) => mercatorProj.forward(lngLat);

export const mercatorBboxToLngLatBbox = (mercatorBbox: Bbox, precision?: number) => {
  let bbox = [
    ...(mercatorToLngLat([mercatorBbox[0], mercatorBbox[1]])),
    ...(mercatorToLngLat([mercatorBbox[2], mercatorBbox[3]])),
  ];
  if (precision) {
    bbox = bbox.map(d => Math.round(d / precision) * precision);
  }
  return bbox
}
