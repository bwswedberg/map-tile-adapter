import * as epsg3857 from '../epsg3857';
import { WebMercator } from '../WebMercator';

const dcLngLat = [-77.035278, 38.889484];

describe('getResolution', () => {
  const initialResolution = 156543.03392804097;

  test.each([
    ['zoom 0', 0, 256, initialResolution],
    ['zoom 7', 7, 256, 1222.99245256282],
    ['zoom 0 different tile size', 0, 512, initialResolution / 2],
  ])('should return correct meters/pixel - %s', (label, zoom, tileSize, res) => {
    const output = epsg3857.getResolution(zoom, tileSize);
    expect(output).toBe(res);

    const wm = new WebMercator(tileSize);
    expect(wm.resolution(zoom)).toBe(output);
  });
});

describe('lngLatToMeters', () => {
  test.each([
    ['origin', [0, 0], [0, 0]],
    ['dc', dcLngLat, [-8575527.920078263, 4705853.444521514]]
  ])('should return correct meters - %s', (label, lngLat, meters) => {
    const output = epsg3857.lngLatToMeters(lngLat);
    expect(output).toStrictEqual([
      expect.closeTo(meters[0], 7),
      expect.closeTo(meters[1], 7),
    ]);
  });
});

describe('metersToLngLat', () => {
  test.todo('todo');
});

describe('metersToPixels', () => {
  test.todo('todo');
});

describe('tileBbox', () => {
  test.todo('todo');
});

describe('pixelsToMeters', () => {
  test.todo('todo');
});

describe('pixelsToTile', () => {
  test.todo('todo');
});

describe('pixelsToRaster', () => {
  test.todo('todo');
});

describe('lngLatToTile', () => {
  test.todo('todo');
});

describe('metersToTile', () => {
  test.todo('todo');
});

describe('tmsTileToGoogleTile', () => {
  test.todo('todo');
});

describe('tmsTileToQuadKey', () => {
  test.todo('todo');
});

describe('quadKeyToTmsTile', () => {
  test.todo('todo');
});