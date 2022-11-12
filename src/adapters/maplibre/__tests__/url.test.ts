import { Bbox, Tile } from 'src/types';
import { parseCustomProtocolRequestUrl, ParseCustomProtocolRequestUrlOutput } from '../url';

describe('parseCustomProtocolUrl', () => {
  const tile: Tile = [1, 2, 3]; // [x, y, z];
  const bbox: Bbox = [10, 20, 30, 40]; // [xmin, ymin, xmax, ymax]
  const urlTemplate = 'https://https://tilehost.com/{sz}/{sx}/{sy}.png?bbox={sbbox}&xmin={sxmin}&ymin={symin}&xmax={sxmax}&ymax={symax}'

  test.each<[string, string, ParseCustomProtocolRequestUrlOutput]>([
    [
      'required',
      `mta://bbox=10,20,30,40&x=1&y=2&z=3://${urlTemplate}`,
      { tile, bbox, urlTemplate, interval: undefined, sourceTileSize: undefined, destinationTileSize: undefined },
    ],
    [
      'interval',
      `mta://bbox=10,20,30,40&x=1&y=2&z=3&interval=256,1://${urlTemplate}`,
      { tile, bbox, urlTemplate, interval: [256, 1], sourceTileSize: undefined, destinationTileSize: undefined },
    ],
    [
      'tile size',
      `mta://bbox=10,20,30,40&x=1&y=2&z=3&size=512://${urlTemplate}`,
      { tile, bbox, urlTemplate, interval: undefined, sourceTileSize: 512, destinationTileSize: 512 },
    ],
    [
      'tile size (individual)',
      `mta://bbox=10,20,30,40&x=1&y=2&z=3&ssize=512&dsize=256://${urlTemplate}`,
      { tile, bbox, urlTemplate, interval: undefined, sourceTileSize: 512, destinationTileSize: 256 },
    ]
  ])('should parse custom protocol request url - %s', (label, url, parsedReqUrl) => {
    const output = parseCustomProtocolRequestUrl(url);
    expect(output).toStrictEqual(parsedReqUrl);
  });
});
