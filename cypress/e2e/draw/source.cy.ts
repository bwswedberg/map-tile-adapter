import { epsg4326ToEpsg3857Presets } from 'src';
import { MapTileAdapterContext } from 'src/types';
import { fetchImage, TileCache } from 'src/util';
import trondheim from 'cypress/fixtures/trondheim.json';
import { drawSource } from 'src/draw/source';
import { addNoCacheInterceptMiddleware, getMaptilerEpsg4326Paths } from 'cypress/support/tiles';

describe('drawSource', () => {
  beforeEach(() => {
    addNoCacheInterceptMiddleware();
    cy.visit('blank-page');
  });

  it('should return source canvas with metadata', () => {
    const zoom = 6;

    for (const source of trondheim.mappings[zoom].sources) {
      const { url, fixture } = getMaptilerEpsg4326Paths(source.tile);
      cy.intercept(url, { fixture });
    }

    cy.wrap(null).then(async () => {
      const sourceRequests = await Promise.all(
        trondheim.mappings[zoom].sources.map(async ({ tile, bbox }) => {
          const image = await fetchImage(getMaptilerEpsg4326Paths(tile).url);
          return { tile, bbox, image };
        })
      );
  
      const ctx: MapTileAdapterContext = {
        cache: new TileCache<HTMLImageElement | null>({ 
          fetchTile: () => Promise.resolve(null),
          maxCache: 10,
        }),
        destinationTileSize: 256,
        interval: [256, 256],
        sourceTileSize: 256,
        ...epsg4326ToEpsg3857Presets()
      };
  
      const output = drawSource(ctx, sourceRequests);
  
      expect(output.zoom).to.equal(zoom - 1); // default `zoomOffset` is -1
      expect(output.translate).to.deep.equal([8448, 1024]);
      expect(output.canvas).to.be.instanceOf(HTMLCanvasElement);
      expect(output.canvas.width).to.be.equal(256);
      expect(output.canvas.height).to.be.equal(512);

      cy.get('body').then(el => {
        el.append(output.canvas);
      });
    });

    cy.get('canvas').matchImage();
  });
});