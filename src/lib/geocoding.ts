export interface GeocodedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

// In-memory cache to respect Nominatim rate limits (max 1 req/sec)
const geocodeCache = new Map<string, GeocodedLocation>();

// Fallbacks for common locations
const STATIC_FALLBACKS: Record<string, GeocodedLocation> = {
  'hsr layout': {
    displayName: 'HSR Layout, Bangalore, Karnataka, India',
    latitude: 12.9121,
    longitude: 77.6446,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  },
  'hsr layout, bangalore': {
    displayName: 'HSR Layout, Bangalore, Karnataka, India',
    latitude: 12.9121,
    longitude: 77.6446,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  },
  'koramangala': {
    displayName: 'Koramangala, Bangalore, Karnataka, India',
    latitude: 12.9352,
    longitude: 77.6245,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  },
  'indiranagar': {
    displayName: 'Indiranagar, Bangalore, Karnataka, India',
    latitude: 12.9784,
    longitude: 77.6408,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  },
  'whitefield': {
    displayName: 'Whitefield, Bangalore, Karnataka, India',
    latitude: 12.9698,
    longitude: 77.7499,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  },
};

export async function geocodeAddress(query: string): Promise<GeocodedLocation | null> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!;
  }

  for (const [key, loc] of Object.entries(STATIC_FALLBACKS)) {
    if (normalized.includes(key)) {
      geocodeCache.set(normalized, loc);
      return loc;
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FastPace-LocalSalesOS/1.0 (local-dev; support@fastpace.local)',
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Nominatim returned status: ${res.status}`);
      return fallbackForUnknown(query);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const result: GeocodedLocation = {
        displayName: first.display_name,
        latitude: parseFloat(first.lat),
        longitude: parseFloat(first.lon),
        city: first.address?.city || first.address?.town || first.address?.suburb || 'Bengaluru',
        state: first.address?.state || 'Karnataka',
        country: first.address?.country || 'India',
      };
      geocodeCache.set(normalized, result);
      return result;
    }
  } catch (err) {
    console.warn('Geocoding network request failed, using fallback:', err);
  }

  return fallbackForUnknown(query);
}

function fallbackForUnknown(query: string): GeocodedLocation {
  // Default to Bangalore center if unknown query
  const fallback: GeocodedLocation = {
    displayName: `${query} (Estimated Location)`,
    latitude: 12.9121,
    longitude: 77.6446,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  };
  return fallback;
}
