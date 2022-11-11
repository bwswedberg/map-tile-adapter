import { Bbox, Tile } from "src/types";

export const getImageUrl = (
  urlTemplate: string,
  sourceTile: Tile,
  sourceBbox: Bbox,
) => {
  return (
    urlTemplate
      .replace('{sbbox}', `${sourceBbox.join(',')}`)
      .replace('{sxmin}', `${sourceBbox[0]}`)
      .replace('{symin}', `${sourceBbox[1]}`)
      .replace('{sxmax}', `${sourceBbox[2]}`)
      .replace('{symax}', `${sourceBbox[3]}`)
      .replace('{sx}', `${sourceTile[0]}`)
      .replace('{sy}', `${sourceTile[1]}`)
      .replace('{sz}', `${sourceTile[2]}`)
  );
};