import { AbstrctCanvasRenderingContext2D, Bbox, MapTileAdapterContext, Tile } from "src/types";

export const drawSource = <TContext extends AbstrctCanvasRenderingContext2D, TImage = any>(
  ctx: MapTileAdapterContext<TContext, TImage>,
  sources: { tile: Tile, image: TImage | null, bbox: Bbox }[], 
) => {
  const zoom = sources[0].tile[2];

  const sp0 = ctx.sourceToPixel([
    Math.min(...sources.map(d => d.bbox[0])),
    Math.min(...sources.map(d => d.bbox[1]))
  ], zoom, ctx.sourceTileSize);

  const sp1 = ctx.sourceToPixel([
    Math.max(...sources.map(d => d.bbox[2])),
    Math.max(...sources.map(d => d.bbox[3]))
  ], zoom, ctx.sourceTileSize);

  const sBbox = [
    Math.min(sp0[0], sp1[0]),
    Math.min(sp0[1], sp1[1]),
    Math.max(sp0[0], sp1[0]),
    Math.max(sp0[1], sp1[1]),
  ];

  const canvasCtx = ctx.createCanvasRenderingContext2D(
    sBbox[2] - sBbox[0], // width
    sBbox[3] - sBbox[1] // height
  );

  // Create working canvas to access fetched images
  for (const { bbox, image } of sources) {
    if (!image) continue;

    const t0 = ctx.sourceToPixel([bbox[0], bbox[1]], zoom, ctx.sourceTileSize);
    const t1 = ctx.sourceToPixel([bbox[2], bbox[3]], zoom, ctx.sourceTileSize);

    const tBbox = [
      Math.min(t0[0], t1[0]),
      Math.min(t0[1], t1[1]),
      Math.max(t0[0], t1[0]),
      Math.max(t0[1], t1[1]),
    ];

    canvasCtx.drawImage(
      image, 
      tBbox[0] - sBbox[0], // sx
      tBbox[1] - sBbox[1] // sy
    );
  }
  
  return {
    translate: [sBbox[0], sBbox[1]],
    zoom,
    canvas: canvasCtx.canvas
  };
};