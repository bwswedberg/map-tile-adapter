import { Canvas } from "canvas";
import { createTestCanvasImage, getMaptilerEpsg4326Url, getTestHTMLImageElement } from 'test/util';
import trondheim from 'test/assets/trondheim.json';
import { Tile, Bbox, MapTileAdapterContext } from "src/types";
import { TileCache } from "src/util";
import { epsg4326ToEpsg3857Presets } from "src/presets";
import { loadTile } from "../base";

jest.mock('src/util/dom');

const { destinationTileSize, sourceTileSize } = trondheim.metadata;

const createMapTileAdapterContext = (props: Partial<MapTileAdapterContext> = {}): MapTileAdapterContext => {
  return {
    cache: new TileCache<HTMLImageElement | null>({ 
      fetchTile: async (url) => await getTestHTMLImageElement(url),
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
    sourceRequests = sources.map(({ tile, bbox }) => {
      const url = getMaptilerEpsg4326Url(tile)
      return { tile, bbox, url };
    });
  })


  test('should return results with using [TileSize, TileSize] interval', async () => {
    const ctx = createMapTileAdapterContext({
      interval: [destinationTileSize, destinationTileSize]
    });

    const checkCanceledMock = jest.fn().mockReturnValue(false);

    const output = await loadTile({
      ctx, 
      destinationRequest: { tile: destination.tile, bbox: destination.bbox },
      sourceRequests, 
      checkCanceled: checkCanceledMock,
    });

    expect(output?.zoom).toBe(destination.tile[2]);
    expect(output?.translate).toStrictEqual([
      destination.tile[0] * destinationTileSize, 
      destination.tile[1] * destinationTileSize, 
    ]);
    expect(output?.canvas).toBeInstanceOf(Canvas);
    expect(output?.canvas.width).toBe(destinationTileSize);
    expect(output?.canvas.height).toBe(destinationTileSize);
    expect(checkCanceledMock).toHaveBeenCalledTimes(2);

    const canvas = output?.canvas;
    if (!canvas) throw new Error('No canvas provided');
    expect(createTestCanvasImage(canvas)).toMatchImageSnapshot();
  });

  test('should return results with using [TileSize, 1] interval', async () => {
    const ctx = createMapTileAdapterContext({
      interval: [destinationTileSize, 1]
    });

    const checkCanceledMock = jest.fn().mockReturnValue(false);

    const output = await loadTile({
      ctx, 
      destinationRequest: { tile: destination.tile, bbox: destination.bbox },
      sourceRequests, 
      checkCanceled: checkCanceledMock,
    });

    expect(output?.zoom).toBe(destination.tile[2]);
    expect(output?.translate).toStrictEqual([
      destination.tile[0] * destinationTileSize, 
      destination.tile[1] * destinationTileSize, 
    ]);
    expect(output?.canvas).toBeInstanceOf(Canvas);
    expect(output?.canvas.width).toBe(destinationTileSize);
    expect(output?.canvas.height).toBe(destinationTileSize);
    expect(checkCanceledMock).toHaveBeenCalledTimes(2);

    const canvas = output?.canvas;
    if (!canvas) throw new Error('No canvas provided');
    expect(createTestCanvasImage(canvas)).toMatchImageSnapshot();
  });

  test('should bail when canceled before source tile requests', async () => {
    const ctx = createMapTileAdapterContext({
      interval: [destinationTileSize, destinationTileSize]
    });

    const checkCanceledMock = jest.fn().mockReturnValue(true);

    const output = await loadTile({
      ctx, 
      destinationRequest: { tile: destination.tile, bbox: destination.bbox },
      sourceRequests, 
      checkCanceled: checkCanceledMock,
    });

    expect(output).toBeNull();
    expect(checkCanceledMock).toHaveBeenCalledTimes(1);
  });

  test('should bail when no images', async () => {
    // Mock no source images
    sourceRequests = sourceRequests.map(d => ({
      ...d,
      url: 'tile-should-not-exist.png',
    }))

    const ctx = createMapTileAdapterContext({
      interval: [destinationTileSize, destinationTileSize]
    });

    const checkCanceledMock = jest.fn().mockReturnValue(false);

    const output = await loadTile({
      ctx, 
      destinationRequest: { tile: destination.tile, bbox: destination.bbox },
      sourceRequests, 
      checkCanceled: checkCanceledMock,
    });

    expect(output).toBeNull();
    expect(checkCanceledMock).toHaveBeenCalledTimes(1);
  });

  test('should bail when canceled after source tile requests', async () => {
    const ctx = createMapTileAdapterContext({
      interval: [destinationTileSize, destinationTileSize]
    });

    const checkCanceledMock = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    
    const output = await loadTile({
      ctx, 
      destinationRequest: { tile: destination.tile, bbox: destination.bbox },
      sourceRequests, 
      checkCanceled: checkCanceledMock,
    });

    expect(output).toBeNull();
    expect(checkCanceledMock).toHaveBeenCalledTimes(2);
  });

  test('should return partial tile when some images return null', async () => {
    // Sanity check to make sure more than 1 tile request
    expect(sources.length).toBeGreaterThan(1);

    // Mock 2nd tile missing
    sourceRequests[1] = {
      ...sourceRequests[1],
      url: 'tile-should-not-exist.png',
    };

    const ctx = createMapTileAdapterContext({
      interval: [destinationTileSize, destinationTileSize]
    });

    const checkCanceledMock = jest.fn().mockReturnValue(false);

    const output = await loadTile({
      ctx, 
      destinationRequest: { tile: destination.tile, bbox: destination.bbox },
      sourceRequests, 
      checkCanceled: checkCanceledMock,
    });

    expect(output?.zoom).toBe(destination.tile[2]);
    expect(output?.translate).toStrictEqual([
      destination.tile[0] * destinationTileSize, 
      destination.tile[1] * destinationTileSize, 
    ]);
    expect(output?.canvas).toBeInstanceOf(Canvas);
    expect(output?.canvas.width).toBe(destinationTileSize);
    expect(output?.canvas.height).toBe(destinationTileSize);
    expect(checkCanceledMock).toHaveBeenCalledTimes(2);

    const canvas = output?.canvas;
    if (!canvas) throw new Error('No canvas provided');
    expect(createTestCanvasImage(canvas)).toMatchImageSnapshot();
  });

});