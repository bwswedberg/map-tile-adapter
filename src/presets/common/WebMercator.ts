// License MIT
// See https://github.com/datalyze-solutions/globalmaptiles/blob/master/globalmaptiles.js
// Modified API and syntax

const pi_div_360 = Math.PI / 360.0;
const pi_div_180 = Math.PI / 180.0;
const pi_div_2 = Math.PI / 2.0;
const pi_2 = Math.PI * 2;
const _180_div_pi = 180 / Math.PI;
const ORIGIN_SHIFT = pi_2 * 6378137 / 2.0;

export class WebMercator {
  private readonly initialResolution: number;

    constructor(private readonly tileSize = 256) {
      this.initialResolution = pi_2 * 6378137 / this.tileSize;
    }

    /**
     * Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
     * 
     * @param lngLat
     * @returns 
     */
    static lngLatToMeters([lng, lat]: number[]) {
      const mx = lng * ORIGIN_SHIFT / 180.0;
      let my = Math.log(Math.tan((90 + lat) * pi_div_360)) / pi_div_180;
      my = my * ORIGIN_SHIFT / 180.0;
      return [mx, my];
    }

    /**
     * Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum
     * 
     * @param xy 
     * @returns 
     */
    static metersToLngLat([mx, my]: number[]) {
      const lng = mx / ORIGIN_SHIFT * 180.0;
      let lat = my / ORIGIN_SHIFT * 180.0;
      lat = _180_div_pi * (2 * Math.atan(Math.exp(lat * pi_div_180)) - pi_div_2);
      return [lng, lat];
    }

    /**
     * Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
     * @param xy 
     * @param zoom 
     * @returns 
     */
    metersToPixels([mx, my]: number[], zoom: number) {
      const res = this.resolution(zoom);
      const px = (mx + ORIGIN_SHIFT) / res;
      const py = (my + ORIGIN_SHIFT) / res;
      return [px, py];
    }

    /**
     * Resolution (meters/pixel) for given zoom level (measured at Equator)
     * @param zoom 
     * @returns 
     */
    resolution(zoom: number) {
      return this.initialResolution / Math.pow(2, zoom);
    }

    /**
     * Returns bounds of the given tile in EPSG:900913 coordinates
     * @param tilePoint
     * @param zoom 
     * @returns 
     */
    tileBbox([tx, ty]: number[], zoom: number) {
      const [xmin, ymin] = this.pixelsToMeters([
        tx * this.tileSize,
        ty * this.tileSize
      ], zoom);
      const [xmax, ymax] = this.pixelsToMeters([
        (tx + 1) * this.tileSize,
        (ty + 1) * this.tileSize,
      ], zoom);
      return [xmin, ymin, xmax, ymax];
    }

    /**
     * Converts pixel coordinates in given zoom level of pyramid to EPSG:900913
     * @param xy
     * @param zoom 
     * @returns 
     */
    pixelsToMeters([px, py]: number[], zoom: number) {
      const res = this.resolution(zoom);
      const mx = px * res - ORIGIN_SHIFT;
      const my = py * res - ORIGIN_SHIFT;
      return [mx, my];
    }

    /**
     * Returns a tile covering region in given pixel coordinates
     * @param xy
     * @returns 
     */
    pixelsToTile([px, py]: number[]) {
      const tx = Math.round(Math.ceil(px / this.tileSize) - 1);
      const ty = Math.round(Math.ceil(py / this.tileSize) - 1);
      return [tx, ty];
    }

    /**
     * Move the origin of pixel coordinates to top-left corner
     * @param xy
     * @param zoom 
     * @returns 
     */
    pixelsToRaster([px, py]: number[], zoom: number) {
      const mapSize = this.tileSize << zoom;
      return [px, mapSize - py];
    }

    lngLatToTile([lng, lat]: number[], zoom: number) {
      const mCoord = WebMercator.lngLatToMeters([lng, lat]);
      const pCoord = this.metersToPixels(mCoord, zoom);
      return this.pixelsToTile(pCoord);
    }

    metersToTile([mx, my]: number[], zoom: number) {
      const pCoord = this.metersToPixels([mx, my], zoom);
      return this.pixelsToTile(pCoord);
    }

    /**
     * Converts TMS tile coordinates to Google Tile coordinates
     * coordinate origin is moved from bottom-left to top-left corner of the extent
     * @param tile
     * @param zoom
     * @returns 
     */
    static tmsTileToGoogleTile([x, y, z]: number[]) {
      return [x, Math.pow(2, z) - 1 - y, z];
    }

    /**
     * Converts TMS tile coordinates to Microsoft QuadTree
     * @param tilePoint 
     * @param zoom
     * @returns 
     */
    static tmsTileToQuadKey([x, y, z]: number[]) {
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
    static quadKeyToTmsTile(quadKey: string) {
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
}
