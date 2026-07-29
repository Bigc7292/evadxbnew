export function latLngFromTile(x: number, y: number, zoom: number): { lat: number; lng: number } {
  const n = Math.pow(2, zoom);
  const lng = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  const lat = latRad * 180 / Math.PI;
  return { lat, lng };
}

export function extractCoordsFromMapsUrl(url: string | null): { lat: number | null; lng: number | null } {
  if (!url) return { lat: null, lng: null };
  try {
    const parsed = new URL(url);
    const iParam = Array.from(parsed.searchParams.keys()).find(k => k.startsWith('1i'));
    const jParam = Array.from(parsed.searchParams.keys()).find(k => k.startsWith('2i'));
    if (iParam && jParam) {
      const i = parseInt(iParam.slice(2));
      const j = parseInt(jParam.slice(2));
      const coords = latLngFromTile(i, j, 16);
      return { lat: coords.lat, lng: coords.lng };
    }
  } catch {
    // ignore parse errors
  }
  return { lat: null, lng: null };
}
