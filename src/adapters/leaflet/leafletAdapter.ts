import type * as L from 'leaflet';
import { tileBbox, tmsToXyz } from 'src/proj/epsg3857';
import { MapTileAdapterContext, MapTileAdapterOptions } from 'src/types';
import { fetchImage, TileCache } from 'src/util';
import { loadTileWithCancel } from '../core/coreAdapter';

type LocalLeaflet = (typeof L) & { MtaLayer: any, mtaLayer: any };

declare global {
  interface Window {
    L: LocalLeaflet
  }
}

interface LeafletTileAdapterOptions extends MapTileAdapterOptions {
  url: string;
}

type MtaLayerThis = L.GridLayer & { options: LeafletTileAdapterOptions, _ctx: MapTileAdapterContext }

// See https://leafletjs.com/examples/extending/extending-2-layers.html
window.L.MtaLayer = window.L.GridLayer.extend({
  createTile: function(this: MtaLayerThis, coords: L.Coords, done: (error?: unknown, el?: HTMLElement) => void) {
    const xyzTile = tmsToXyz([coords.x, coords.y, coords.z]);

    const img = new Image();
    const size = this.getTileSize();
    img.width = size.x;
    img.height = size.y

    loadTileWithCancel({
      ctx: this._ctx,
      url: this.options.url,
      destinationRequest: {
        tile: xyzTile,
        bbox: tileBbox(xyzTile, size.x)
      }
    })
    .promise
    .then((result) => {
      if (!result?.canvas) return done(undefined, img);
      img.src = result.canvas.toDataURL();
      done(undefined, img);
    })
    .catch(error => done(error, img));

    return img;
  }
}).addInitHook(function (this: MtaLayerThis) {
  const options = this.options;
  const cache = new TileCache<HTMLImageElement | null>({
    fetchTile: url => fetchImage(url),
    maxCache: options.cacheSize ?? 10,
  });
  const destinationTileSize = this.getTileSize().x;
  const ctx: MapTileAdapterContext = { 
    cache,
    destinationTileSize,
    destinationTileToSourceTiles: options.destinationTileToSourceTiles,
    destinationToPixel: options.destinationToPixel,
    destinationToSource: options.destinationToSource,
    interval: options?.interval ?? [destinationTileSize, destinationTileSize],
    pixelToDestination: options.pixelToDestination,
    sourceTileSize: options?.sourceTileSize ?? destinationTileSize,
    sourceToPixel: options.sourceToPixel,
  };
  this._ctx = ctx;
});

window.L.mtaLayer = function (opts: LeafletTileAdapterOptions) {
  return new window.L.MtaLayer(opts);
};
