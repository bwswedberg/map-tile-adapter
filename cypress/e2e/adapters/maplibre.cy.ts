import { epsg4326ToEpsg3857Presets, maplibreTileAdapterProtocol } from 'src';
import { Tile } from 'src/types';
import type MaplibreGl from 'maplibre-gl';
import { addNoCacheInterceptMiddleware, getMaptilerEpsg4326Paths } from 'cypress/support/tiles';

const interceptTileRequest = (tile: Tile) => {
  const { url, fixture } = getMaptilerEpsg4326Paths(tile);
  if (!fixture) {
    cy.intercept(url, { statusCode: 204 });
  } else {
    cy.intercept(url, { fixture });
  }
}

describe('maplibre', () => {
  beforeEach(() => {
    cy.visit('maplibre-page');
    addNoCacheInterceptMiddleware();
    const z = 2;
    for (let x = 0; x < (2 << z); x++) {
      for (let y = 0; y < (1 << z); y++) {
        interceptTileRequest([x, y, z]);
      }
    }
  });

  it('should render maplibre map using epsg:4326 to epsg:3857 adapter', () => {
    cy.window().then((window) => {
      const mtaProtocol = maplibreTileAdapterProtocol({
        sourceTileSize: 256,
        destinationTileSize: 256,
        interval: [256, 1],
        ...epsg4326ToEpsg3857Presets()
      });

      (window.maplibregl as unknown as typeof MaplibreGl).addProtocol(
        mtaProtocol.protocol, 
        mtaProtocol.loader
      );
      
      new window.maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {
            'epsg4326source': {
              type: 'raster',
              tiles: [`${mtaProtocol.tileUrlPrefix}://https://tilehost.com/{sz}/{sx}/{sy}.png`],
              tileSize: 256,
              scheme: 'xyz'
            },
          },
          layers: [
            { id: 'epsg4326layer', source: 'epsg4326source', type: 'raster' },
          ]
        },
        center: [0, 45],
        zoom: 2
      });
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000); // wait for map to render tiles

    cy.get('#map').matchImage();
  });
});