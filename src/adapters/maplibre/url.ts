import type { Bbox, Tile } from "../../types";

export const parseUrl = (url: string) => {
  const [, reprojParamsStr, ...urlTemplates] = url.split(/:\/\//);
  const urlTemplate = urlTemplates.join('://');
  const reprojParams = new URLSearchParams(reprojParamsStr);
  const tile: Tile = [
    +(reprojParams.get('x') ?? 0),
    +(reprojParams.get('y') ?? 0),
    +(reprojParams.get('z') ?? 0),
  ];
  const bbox = (reprojParams.get('bbox') ?? '').split(',').map((d: string) => +d);
  return { bbox, tile, urlTemplate };
};

export const parseUrl2 = (url: string) => {
  const [, reprojParamsStr, ...urlTemplates] = url.split(/:\/\//);
  const urlTemplate = urlTemplates.join('://');
  const [xmin, ymin, xmax, ymax, x, y, z] = reprojParamsStr.split(',').map(d => +d);
  return { 
    bbox: [xmin, ymin, xmax, ymax], 
    tile: [x, y, z], 
    urlTemplate
  };
};

export const getImageUrl = (
  urlTemplate: string,
  sourceTile: Tile,
  sourceBbox: Bbox,
) => {
  return (
    urlTemplate
      .replace('{bbox-source}', `${sourceBbox.join(',')}`)
      .replace('{xmin-source}', `${sourceBbox[0]}`)
      .replace('{ymin-source}', `${sourceBbox[1]}`)
      .replace('{xmax-source}', `${sourceBbox[2]}`)
      .replace('{ymax-source}', `${sourceBbox[3]}`)
      .replace('{x-source}', `${sourceTile[0]}`)
      .replace('{y-source}', `${sourceTile[1]}`)
      .replace('{z-source}', `${sourceTile[2]}`)
  );
};


