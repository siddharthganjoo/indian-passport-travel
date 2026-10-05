/**
 * Pre-projects Natural Earth 1:110m country outlines into compact SVG paths
 * (data/world-map.json) so the browser draws the map with no geo maths.
 *
 *   curl -sLo /tmp/ne110.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
 *   npx tsx scripts/build-world-map.ts /tmp/ne110.geojson
 *
 * Countries too small for 1:110m (Singapore, Maldives, Caribbean & Pacific
 * islands…) are drawn as dots at their main airport by the map component.
 */
import fs from 'node:fs';
import path from 'node:path';
import { geoEqualEarth, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { MAP_HEIGHT, MAP_WIDTH } from '../lib/map-size';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npx tsx scripts/build-world-map.ts <ne_110m_admin_0_countries.geojson>');
  process.exit(1);
}

type Props = { ISO_A2_EH: string; NAME: string };
const geo = JSON.parse(fs.readFileSync(src, 'utf-8')) as FeatureCollection<Geometry, Props>;
const features = geo.features.filter((f) => f.properties.ISO_A2_EH !== '-99' && f.properties.ISO_A2_EH !== 'AQ');

const projection = geoEqualEarth().fitExtent(
  [
    [4, 4],
    [MAP_WIDTH - 4, MAP_HEIGHT - 4],
  ],
  { type: 'FeatureCollection', features }
);
const toPath = geoPath(projection);

/** Round every number in a path string to 1 decimal place. */
const compact = (d: string) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

const countries = features
  .map((f) => ({ code: f.properties.ISO_A2_EH, name: f.properties.NAME, d: compact(toPath(f) ?? '') }))
  .filter((c) => c.d)
  .sort((a, b) => a.code.localeCompare(b.code));

const out = {
  source: 'Natural Earth 1:110m (public domain)',
  projection: { name: 'equalEarth', scale: projection.scale(), translate: projection.translate() },
  countries,
};
const file = path.join(__dirname, '..', 'data', 'world-map.json');
fs.writeFileSync(file, JSON.stringify(out));
console.log(`world-map.json: ${countries.length} countries, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
console.log('projection', out.projection);
