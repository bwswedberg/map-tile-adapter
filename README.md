# Map Tile Adapter
Reproject map tiles in the browser.
- **Problem:** Your map uses projection X but you've got requirements to show map tiles that are projected in Y.
- **Solution:** Use `map-tile-adapter` to reproject your map tiles in the browser.

## WARNING
This project is in beta and subject to breaking API changes. Documentation and improved test coverage will be provided in the near future.

## Usage

## Accuracy

## API

### Maplibre GL

### Vanilla

## Roadmap
- leaflet
- deck.gl
- mapboxgl-js

## Prior Art
- [Tiles à la Google Maps](https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/) and [globalmaptiles.js](https://github.com/datalyze-solutions/globalmaptiles/blob/master/globalmaptiles.js) for map tile conversion
- [Raster Reprojection (Mike Bostock)](https://bl.ocks.org/mbostock/4329423)
- [Reprojected Raster Tiles (Jason Davies)](https://www.jasondavies.com/maps/raster/)
- [A stackoverflow deep dive on reprojecting map tiles in d3 (Andrew Reid)](https://stackoverflow.com/a/56642588)

## Development
1. Update the `CHANGELOG.md` with new version and commit the change.
1. Run `npm version patch` or somethign similar or tag manually
1. Push tag to remote `git push --tags`
1. Verify build passes (TODO: pushed tags should do this in github actions)
1. Publish `npm publish`
