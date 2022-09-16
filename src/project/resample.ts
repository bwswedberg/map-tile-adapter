import * as tilebelt from 'tilebelt-wgs84';
import { ReprojectionMethod } from "../types";
import { canvasContextToArrayBuffer, createCanvasContext, mercatorToLngLat } from "./common";

export const resampleTiles: ReprojectionMethod = async (ctx, req, tiles) => {
  const sTileBbox = [
    Math.min(...tiles.map(d => d.tile[0])),
    Math.min(...tiles.map(d => d.tile[1])),
    Math.max(...tiles.map(d => d.tile[0])),
    Math.max(...tiles.map(d => d.tile[1])),
  ];
  const mercatorCanvas = createCanvasContext(ctx.props.tileSize, ctx.props.tileSize);
  const [matrixWidth, matrixHeight] = tilebelt.getExtent(req.mercatorTile[2] + ctx.props.zoomOffset);
  const wgs84Canvas = createCanvasContext(
    (sTileBbox[2] - sTileBbox[0]) * ctx.props.tileSize + ctx.props.tileSize, 
    (sTileBbox[3] - sTileBbox[1]) * ctx.props.tileSize + ctx.props.tileSize
  );

  if (!mercatorCanvas || !wgs84Canvas) {
    throw new Error('Mercator canvas does not exist');
  }
  
  const sxOffset = sTileBbox[0] * ctx.props.tileSize;
  const syOffset = sTileBbox[1] * ctx.props.tileSize;

  // Create working canvas to access fetched images
  for (const { tile, image } of tiles) {
    wgs84Canvas.drawImage(
      image, 
      tile[0] * ctx.props.tileSize - sxOffset, // sx
      tile[1] * ctx.props.tileSize - syOffset //sy
    );
  }

  const latToPx = (lat: number) => tilebelt.normalizeLat(lat) * matrixHeight * ctx.props.tileSize - syOffset;

  const sx0 = tilebelt.normalizeLng(req.lngLatBbox[0]) * matrixWidth * ctx.props.tileSize - sxOffset;
  const sx1 = tilebelt.normalizeLng(req.lngLatBbox[2]) * matrixWidth * ctx.props.tileSize - sxOffset;
  const sWidth = sx1 - sx0;

  const mercatorLatPerPx = (req.mercatorBbox[3] - req.mercatorBbox[1]) / ctx.props.tileSize;

  for (let i = 0; i < ctx.props.tileSize; i++) {    
    const mercatorLat0 = req.mercatorBbox[3] - (mercatorLatPerPx * i);
    const mercatorLat1 = mercatorLat0 - mercatorLatPerPx;
    const sy0 = latToPx(mercatorToLngLat([req.mercatorBbox[0], mercatorLat0])[1]);
    const sy1 = latToPx(mercatorToLngLat([req.mercatorBbox[0], mercatorLat1])[1]);
    const sHeight = Math.max(sy1 - sy0, 1);
    mercatorCanvas.drawImage(
      wgs84Canvas.canvas, 
      sx0, // sx 
      sy0, // sy
      sWidth, // sWidth 
      sHeight, // sHeight, 
      0, // dx 
      i, // dy, 
      ctx.props.tileSize, // dWidth, 
      1 // dHeight
    )
  }

  return await canvasContextToArrayBuffer(mercatorCanvas);
};