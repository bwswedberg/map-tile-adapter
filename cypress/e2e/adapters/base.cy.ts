import { epsg4326ToEpsg3857Presets } from 'src';
import { Bbox, MapTileAdapterContext, Tile } from 'src/types';
import { fetchImage, TileCache } from 'src/util';
import trondheim from 'cypress/fixtures/trondheim.json';
import { addNoCacheInterceptMiddleware, getMaptilerEpsg4326Paths } from 'cypress/support/tiles';
import { loadTile } from 'src/adapters/base';

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
      fetchTile: async (url) => await fetchImage(url),
      maxCache: 10,
    }),
    destinationTileSize,
    interval: [256, 256],
    sourceTileSize,
    ...epsg4326ToEpsg3857Presets(),
    ...props,
  };
}

describe('loadTile', () => {
  const { destination, sources } = trondheim.mappings[3];
  let sourceRequests: { tile: Tile, bbox: Bbox, url: string }[];

  beforeEach(() => {
    addNoCacheInterceptMiddleware();
    sources.forEach(({ tile }) => interceptTileRequest(tile));
    sourceRequests = sources.map(({ tile, bbox }) => {
      const { url } = getMaptilerEpsg4326Paths(tile);
      return { tile, bbox, url };
    });
    cy.visit('blank-page');
  });

  it('should return results with using [TileSize, TileSize] interval', () => {
    cy.wrap(null).then(async () => {
      const ctx = createMapTileAdapterContext({
        interval: [destinationTileSize, destinationTileSize]
      });
  
      const checkCanceledStub = cy.stub().returns(false);

      const output = await loadTile({
        ctx, 
        destinationRequest: { tile: destination.tile, bbox: destination.bbox },
        sourceRequests, 
        checkCanceled: checkCanceledStub,
      });
  
      expect(output?.zoom).to.equal(destination.tile[2]);
      expect(output?.translate).to.deep.equal([
        destination.tile[0] * destinationTileSize, 
        destination.tile[1] * destinationTileSize, 
      ]);
      expect(output?.canvas).to.be.instanceOf(HTMLCanvasElement);
      expect(output?.canvas.width).to.be.equal(destinationTileSize);
      expect(output?.canvas.height).to.be.equal(destinationTileSize);
      expect(checkCanceledStub.callCount).to.equal(2);

      cy.get('body').then(el => {
        if (output?.canvas) {
          el.append(output?.canvas)
        }
      });
    });

    cy.get('canvas').matchImage();
  });

  it('should return results with using [TileSize, 1] interval', () => {
    cy.wrap(null).then(async () => {
      const ctx = createMapTileAdapterContext({
        interval: [destinationTileSize, 1]
      });
  
      const checkCanceledStub = cy.stub().returns(false);

      const output = await loadTile({
        ctx, 
        destinationRequest: { tile: destination.tile, bbox: destination.bbox },
        sourceRequests, 
        checkCanceled: checkCanceledStub,
      });
  
      expect(output?.zoom).to.equal(destination.tile[2]);
      expect(output?.translate).to.deep.equal([
        destination.tile[0] * destinationTileSize, 
        destination.tile[1] * destinationTileSize, 
      ]);
      expect(output?.canvas).to.be.instanceOf(HTMLCanvasElement);
      expect(output?.canvas.width).to.be.equal(destinationTileSize);
      expect(output?.canvas.height).to.be.equal(destinationTileSize);
      expect(checkCanceledStub.callCount).to.equal(2);

      cy.get('body').then(el => {
        if (output?.canvas) {
          el.append(output?.canvas)
        }
      });
    });

    cy.get('canvas').matchImage();
  });

  it('should bail when canceled before source tile requests', () => {
    cy.wrap(null).then(async () => {
      const ctx = createMapTileAdapterContext({
        interval: [destinationTileSize, destinationTileSize]
      });
  
      const checkCanceledStub = cy.stub().returns(true);

      const output = await loadTile({
        ctx, 
        destinationRequest: { tile: destination.tile, bbox: destination.bbox },
        sourceRequests, 
        checkCanceled: checkCanceledStub,
      });
  
      expect(output).to.be.null;
      expect(checkCanceledStub.callCount).to.equal(1);
    });
  });

  it('should bail when no images', () => {
    cy.wrap(null).then(async () => {
      const ctx = createMapTileAdapterContext({
        interval: [destinationTileSize, destinationTileSize]
      });
  
      const checkCanceledStub = cy.stub().returns(true);

      const output = await loadTile({
        ctx, 
        destinationRequest: { tile: destination.tile, bbox: destination.bbox },
        sourceRequests: [], 
        checkCanceled: checkCanceledStub,
      });
  
      expect(output).to.be.null;
      expect(checkCanceledStub.callCount).to.equal(1);
    });
  });

  it('should bail when canceled after source tile requests', () => {
    cy.wrap(null).then(async () => {
      const ctx = createMapTileAdapterContext({
        interval: [destinationTileSize, destinationTileSize]
      });
  
      const checkCanceledStub = cy.stub();
      checkCanceledStub.onCall(0).returns(false);
      checkCanceledStub.returns(true);

      const output = await loadTile({
        ctx, 
        destinationRequest: { tile: destination.tile, bbox: destination.bbox },
        sourceRequests, 
        checkCanceled: checkCanceledStub,
      });
  
      expect(output).to.be.null;
      expect(checkCanceledStub.callCount).to.equal(2);
    });
  });

  it('should return partial tile when some images return null', () => {
    // Sanity check to make sure more than 1 tile request
    expect(sources).to.have.length.greaterThan(1);

    // Mock 2nd tile missing
    const { url } = getMaptilerEpsg4326Paths(sources[1].tile);
    cy.intercept(url, { statusCode: 204 });

    const sourceRequests = sources.map(({ tile, bbox }) => {
      const { url } = getMaptilerEpsg4326Paths(tile);
      return { tile, bbox, url };
    });

    cy.wrap(null).then(async () => {
      const ctx = createMapTileAdapterContext({
        interval: [destinationTileSize, destinationTileSize]
      });
  
      const checkCanceledStub = cy.stub().returns(false);

      const output = await loadTile({
        ctx, 
        destinationRequest: { tile: destination.tile, bbox: destination.bbox },
        sourceRequests, 
        checkCanceled: checkCanceledStub,
      });
  
      expect(output?.zoom).to.equal(destination.tile[2]);
      expect(output?.translate).to.deep.equal([
        destination.tile[0] * destinationTileSize, 
        destination.tile[1] * destinationTileSize, 
      ]);
      expect(output?.canvas).to.be.instanceOf(HTMLCanvasElement);
      expect(output?.canvas.width).to.be.equal(destinationTileSize);
      expect(output?.canvas.height).to.be.equal(destinationTileSize);
      expect(checkCanceledStub.callCount).to.equal(2);

      cy.get('body').then(el => {
        if (output?.canvas) {
          el.append(output?.canvas)
        }
      });
    });

    cy.get('canvas').matchImage();
  });
});