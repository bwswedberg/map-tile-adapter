import { epsg4326ToEpsg3857Presets } from 'src';
import { MapTileAdapterContext, Tile } from 'src/types';
import { fetchImage, TileCache } from 'src/util';
import trondheim from 'cypress/fixtures/trondheim.json';
import { drawTile } from 'src/draw';
import { addNoCacheInterceptMiddleware, getMaptilerEpsg4326Paths } from 'cypress/support/tiles';

const { destinationTileSize, sourceTileSize } = trondheim.metadata;

const interceptTileRequest = (tile: Tile) => {
  const { url, fixture } = getMaptilerEpsg4326Paths(tile);
  if (!fixture) {
    cy.intercept(url, { statusCode: 204 });
  } else {
    cy.intercept(url, { fixture });
  }
}

const createMapTileAdapterContext = (props: Partial<MapTileAdapterContext> = {}): MapTileAdapterContext => {
  return {
    cache: new TileCache<HTMLImageElement | null>({ 
      fetchTile: () => Promise.resolve(null),
      maxCache: 10,
    }),
    destinationTileSize,
    interval: [256, 256],
    sourceTileSize,
    ...epsg4326ToEpsg3857Presets(),
    ...props,
  };
}

describe('drawTile', () => {
  beforeEach(() => {
    addNoCacheInterceptMiddleware();
    cy.visit('blank-page');
  });

  it('should return with simple props', () => {
    const { destination, sources } = trondheim.mappings[2];

    sources.forEach(({ tile }) => interceptTileRequest(tile));

    cy.wrap(null).then(async () => {
      const sourceRequests = await Promise.all(
        sources.map(async ({ tile, bbox }) => {
          const image = await fetchImage(getMaptilerEpsg4326Paths(tile).url);
          return { tile, bbox, image };
        })
      );
  
      const ctx = createMapTileAdapterContext();
  
      const output = drawTile(
        ctx, 
        sourceRequests, 
        { tile: destination.tile, bbox: destination.bbox, }
      );
  
      expect(output.zoom).to.equal(destination.tile[2]);
      expect(output.translate).to.deep.equal([
        destination.tile[0] * destinationTileSize, 
        destination.tile[1] * destinationTileSize, 
      ]);
      expect(output.canvas).to.be.instanceOf(HTMLCanvasElement);
      expect(output.canvas.width).to.be.equal(destinationTileSize);
      expect(output.canvas.height).to.be.equal(destinationTileSize);

      cy.get('body').then(el => {
        el.append(output.canvas)
      });
    });

    cy.get('canvas').matchImage();
  });

  // Slices because we don't have data for that
  trondheim.mappings.slice(2).map((mapping) => {
    it(`should return source canvas for zoom ${mapping.destination.tile[2]}`, () => {
      const { destination, sources } = mapping;
      sources.forEach(({ tile }) => interceptTileRequest(tile));

      cy.wrap(null).then(async () => {
        const sourceRequests = await Promise.all(
          sources.map(async ({ tile, bbox }) => {
            const image = await fetchImage(getMaptilerEpsg4326Paths(tile).url);
            return { tile, bbox, image };
          })
        );
    
        const ctx = createMapTileAdapterContext({
          interval: [256, 1]
        });
    
        const output = drawTile(
          ctx, 
          sourceRequests, 
          { tile: destination.tile, bbox: destination.bbox, }
        );
    
        expect(output.zoom).to.equal(destination.tile[2]);
        expect(output.translate).to.deep.equal([
          destination.tile[0] * destinationTileSize, 
          destination.tile[1] * destinationTileSize, 
        ]);
        expect(output.canvas).to.be.instanceOf(HTMLCanvasElement);
        expect(output.canvas.width).to.be.equal(destinationTileSize);
        expect(output.canvas.height).to.be.equal(destinationTileSize);

        cy.get('body').then(el => {
          el.append(output.canvas)
        });
      });

      cy.get('canvas').matchImage();
    });
  });

  trondheim.mappings.slice(1).map((mapping) => {
    it(`should return source canvas for zoom ${mapping.destination.tile[2]} with zoomOffset=0`, () => {
      const { destination, sources2x: sources } = mapping;
      sources.forEach(({ tile }) => interceptTileRequest(tile));

      cy.wrap(null).then(async () => {
        const sourceRequests = await Promise.all(
          sources.map(async ({ tile, bbox }) => {
            const image = await fetchImage(getMaptilerEpsg4326Paths(tile).url);
            return { tile, bbox, image };
          })
        );
    
        const ctx = createMapTileAdapterContext({
          interval: [256, 1],
          ...epsg4326ToEpsg3857Presets({ zoomOffset: 0 }),
        });
    
        const output = drawTile(
          ctx, 
          sourceRequests, 
          { tile: destination.tile, bbox: destination.bbox, }
        );
    
        expect(output.zoom).to.equal(destination.tile[2]);
        expect(output.translate).to.deep.equal([
          destination.tile[0] * destinationTileSize, 
          destination.tile[1] * destinationTileSize, 
        ]);
        expect(output.canvas).to.be.instanceOf(HTMLCanvasElement);
        expect(output.canvas.width).to.be.equal(destinationTileSize);
        expect(output.canvas.height).to.be.equal(destinationTileSize);

        cy.get('body').then(el => {
          el.append(output.canvas)
        });
      });

      cy.get('canvas').matchImage();
    });
  })
});