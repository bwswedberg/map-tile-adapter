// License MIT
// See https://github.com/datalyze-solutions/globalmaptiles/blob/master/globalmaptiles.js
// Modified API and syntax

// Degrees to radians
const D2R = Math.PI / 180;

// Radians to degrees
const R2D = 180 / Math.PI;

// Equitorial radius in meters (WGS 84)
const EARTH_RADIUS = 6378137;

// Equitorial circumferance in meters (WGS 84)
const EARTH_CIRCUMFERENCE = Math.PI * 2 * EARTH_RADIUS;

// Translate origin to corner
const ORIGIN_SHIFT = Math.PI * EARTH_RADIUS;

/**
 * Resolution (meters/pixel) for given zoom level (measured at Equator)
 * @param zoom 
 * @returns 
 */
export const getResolution = (zoom: number, tileSize: number) => {
  return (EARTH_CIRCUMFERENCE / tileSize) / (1 << zoom); // Math.pow(2, zoom);
}

/**
 * Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
 * 
 * @param lngLat
 * @returns 
 */
export const lngLatToMeters = ([lng, lat]: number[]) => {
  const mx = lng * ORIGIN_SHIFT / 180;
  let my = Math.log(Math.tan((90 + lat) * (Math.PI / 360))) / D2R;
  my = my * ORIGIN_SHIFT / 180;
  return [mx, my];
}

/**
 * Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum
 * 
 * @param xy 
 * @returns 
 */
export const metersToLngLat = ([mx, my]: number[]) => {
  const lng = mx / ORIGIN_SHIFT * 180;
  let lat = my / ORIGIN_SHIFT * 180;
  lat = R2D * (2 * Math.atan(Math.exp(lat * D2R)) - (Math.PI / 2));
  return [lng, lat];
}

/**
 * Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
 * @param xy 
 * @param zoom 
 * @returns 
 */
export const metersToPixels = ([mx, my]: number[], zoom: number, tileSize: number) => {
  const res = getResolution(zoom, tileSize);
  const px = (mx + ORIGIN_SHIFT) / res;
  const py = (my + ORIGIN_SHIFT) / res;
  return [px, py];
}

/**
 * Returns bounds of the given tile in EPSG:900913 coordinates
 * @param tilePoint
 * @param zoom 
 * @returns bbox [xmin, ymin, xmax, ymax]
 */
export const tileBbox = ([tx, ty]: number[], zoom: number, tileSize: number) => {
  const [xmin, ymin] = pixelsToMeters([
    tx * tileSize,
    ty * tileSize,
  ], zoom, tileSize);
  const [xmax, ymax] = pixelsToMeters([
    (tx + 1) * tileSize,
    (ty + 1) * tileSize,
  ], zoom, tileSize);
  return [xmin, ymin, xmax, ymax];
}

/**
 * Converts pixel coordinates in given zoom level of pyramid to EPSG:900913
 * @param xy
 * @param zoom 
 * @returns 
 */
export const pixelsToMeters = ([px, py]: number[], zoom: number, tileSize: number) => {
  const res = getResolution(zoom, tileSize);
  const mx = px * res - ORIGIN_SHIFT;
  const my = py * res - ORIGIN_SHIFT;
  return [mx, my];
}

/**
 * Returns a tile covering region in given pixel coordinates
 * @param xy
 * @returns 
 */
export const pixelsToTile = ([px, py]: number[], zoom: number, tileSize: number) => {
  const tx = Math.round(Math.ceil(px / tileSize) - 1);
  const ty = Math.round(Math.ceil(py / tileSize) - 1);
  return [tx, ty, zoom];
}

/**
 * Move the origin of pixel coordinates from bottom-left to top-left corner
 * @param xy
 * @param zoom 
 * @returns
 */
export const pixelsToRaster = ([px, py]: number[], zoom: number, tileSize: number) => {
  const mapSize = tileSize << zoom;
  return [px, mapSize - py];
}

/**
 * 
 * @param lngLat 
 * @param zoom 
 * @param tileSize 
 * @returns tile [x, y, z]
 */
export const lngLatToTile = (lngLat: number[], zoom: number, tileSize: number) => {
  const mCoord = lngLatToMeters(lngLat);
  const pCoord = metersToPixels(mCoord, zoom, tileSize);
  return pixelsToTile(pCoord, zoom, tileSize);
}

/**
 * 
 * @param xy 
 * @param zoom 
 * @param tileSize 
 * @returns tile [x, y, z]
 */
export const metersToTile = (xy: number[], zoom: number, tileSize: number) => {
  const pCoord = metersToPixels(xy, zoom, tileSize);
  return pixelsToTile(pCoord, zoom, tileSize);
}

/**
 * Converts TMS tile coordinates to Google Tile coordinates
 * coordinate origin is moved from bottom-left to top-left corner of the extent
 * @param tile
 * @param zoom
 * @returns tile [x, y, z]
 */
export const tmsTileToGoogleTile = ([x, y, z]: number[]) => {
  return [x, Math.pow(2, z) - 1 - y, z];
}

/**
 * Converts TMS tile coordinates to Microsoft QuadTree
 * @param tilePoint 
 * @param zoom
 * @returns 
 */
export const tmsTileToQuadKey = ([x, y, z]: number[]) => {
  let quadKey = "";
  const ty = 2 ** z - 1 - y;
  for (let i = z; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((x & mask) != 0) {
        digit += 1;
    }
    if ((ty & mask) != 0) {
        digit += 2;
    }
    quadKey += digit.toString();
  }
  return quadKey;
}

/**
 * Transform quadkey to tile coordinates
 * @param quadKey 
 * @returns 
 */
export const quadKeyToTmsTile = (quadKey: string) => {
  let tx = 0;
  let ty = 0;
  const zoom = quadKey.length;
  for (let i = 0; i < zoom; i++) {
    const bit = zoom - i;
    const mask = 1 << (bit - 1);
    if (quadKey[zoom - bit] === "1") {
      tx |= mask;
    }
    if (quadKey[zoom - bit] == "2") {
      ty |= mask;
    }
    if (quadKey[zoom - bit] == "3") {
      tx |= mask;
      ty |= mask;
    }
  }
  ty = 2 ** zoom - 1 - ty;
  return [tx, ty, zoom];
}