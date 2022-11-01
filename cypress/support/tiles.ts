import { Tile } from "src/types";

export const MOCK_TILE_SERVER = 'https://tilehost.com';

export const getMaptilerEpsg4326Paths = ([x, y, z]: Tile): { url: string, fixture?: string } => {
  const url = `${MOCK_TILE_SERVER}/${z}/${x}/${y}.png`;
  if (z < 1) {
    return { url };
  }
  return {
    url,
    fixture: `maptiler-epsg4326/${z}/${x}/${y}.png`,
  };
};

export const addNoCacheInterceptMiddleware = () => {
  cy.intercept(
    `${MOCK_TILE_SERVER}/**/*`,
    { middleware: true },
    (req) => {
      req.on('before:response', (res) => {
        // force all API responses to not be cached
        res.headers['cache-control'] = 'no-store'
      })
    }
  )
}
