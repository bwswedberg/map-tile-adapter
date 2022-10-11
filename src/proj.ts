import proj4 from 'proj4';

const mercatorProj = proj4('EPSG:3857', 'EPSG:4326');

export const mercatorToLngLat = (lngLat: number[]) => mercatorProj.forward(lngLat);
