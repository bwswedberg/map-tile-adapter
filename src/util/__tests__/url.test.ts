import { Bbox, Tile } from 'src/types';
import { getImageUrl } from '../url';

describe('getImageUrl', () => {
  const tile: Tile = [1, 2, 3]; // [x, y, z];
  const bbox: Bbox = [10, 20, 30, 40]; // [xmin, ymin, xmax, ymax]

  test.each([
    [
      'tile params',
      'https://tilehost.com/{sz}/{sx}/{sy}.png',
      'https://tilehost.com/3/1/2.png',
    ],
    [
      'source bbox params',
      'https://tilehost.com/tiles?bbox={sbbox}',
      'https://tilehost.com/tiles?bbox=10,20,30,40',
    ],
    [
      'source bbox params enumerated',
      'https://tilehost.com/tiles?xmin={sxmin}&ymin={symin}&xmax={sxmax}&ymax={symax}',
      'https://tilehost.com/tiles?xmin=10&ymin=20&xmax=30&ymax=40',
    ]
  ])('should return valid image url - %s', (label, urlTemplate, imageUrl) => {
    const output = getImageUrl(urlTemplate, tile, bbox);
    expect(output).toBe(imageUrl);
  });
});