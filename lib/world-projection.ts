import { geoEqualEarth, geoInterpolate, geoPath, type GeoProjection } from 'd3-geo';
import worldMap from '@/data/world-map.json';

export { MAP_WIDTH, MAP_HEIGHT } from '@/lib/map-size';

export interface WorldCountryShape {
  code: string;
  name: string;
  d: string;
}

export const WORLD_SHAPES = worldMap.countries as WorldCountryShape[];
export const WORLD_CODES = new Set(WORLD_SHAPES.map((c) => c.code));

let projection: GeoProjection | null = null;

/** The exact projection the base map was baked with, for placing dots and arcs on it. */
export function worldProjection(): GeoProjection {
  if (!projection) {
    const { scale, translate } = worldMap.projection;
    projection = geoEqualEarth().scale(scale).translate(translate as [number, number]);
  }
  return projection;
}

/** Rounded to 0.01 so server and browser floating-point produce identical markup (no hydration mismatch). */
const round2 = (n: number) => Math.round(n * 100) / 100;

export function project(lon: number, lat: number): [number, number] {
  const p = worldProjection()([lon, lat]);
  return p ? [round2(p[0]), round2(p[1])] : [0, 0];
}

/** SVG path for the great-circle arc between two points (follows the Earth's curve). */
export function arcPath(from: [number, number], to: [number, number]): string {
  const interpolate = geoInterpolate(from, to);
  const coordinates = Array.from({ length: 33 }, (_, i) => interpolate(i / 32));
  return geoPath(worldProjection()).digits(1)({ type: 'LineString', coordinates }) ?? '';
}
