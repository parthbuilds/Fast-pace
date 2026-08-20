import { CATEGORIES } from './categories';

export interface RawDiscoveredBusiness {
  osmId: string;
  name: string;
  category: string;
  subcategory?: string;
  address?: string;
  area?: string;
  city?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  rating?: number;
  reviewCount?: number;
  mapsUrl?: string;
  rawTags: Record<string, string>;
}

// In-memory query cache for Overpass responses
const overpassCache = new Map<string, { timestamp: number; data: RawDiscoveredBusiness[] }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Build Overpass QL query for selected category IDs
export function buildOverpassQuery(
  lat: number,
  lon: number,
  radiusMetres: number,
  categoryIds: string[]
): string {
  const selectedDefs = CATEGORIES.filter((c) => categoryIds.includes(c.id));
  const tagClauses: string[] = [];

  for (const cat of selectedDefs) {
    for (const tag of cat.osmTags) {
      tagClauses.push(`nwr["${tag.key}"="${tag.value}"](around:${radiusMetres},${lat},${lon});`);
    }
  }

  // If no specific category, fallback to restaurants + clinics + salons
  if (tagClauses.length === 0) {
    tagClauses.push(`nwr["amenity"="restaurant"](around:${radiusMetres},${lat},${lon});`);
    tagClauses.push(`nwr["amenity"="clinic"](around:${radiusMetres},${lat},${lon});`);
    tagClauses.push(`nwr["shop"="hairdresser"](around:${radiusMetres},${lat},${lon});`);
  }

  return `
    [out:json][timeout:25];
    (
      ${tagClauses.join('\n      ')}
    );
    out center tags;
  `.trim();
}

export async function fetchBusinessesFromOverpass(
  lat: number,
  lon: number,
  radiusKm: number,
  categoryIds: string[]
): Promise<{ businesses: RawDiscoveredBusiness[]; cached: boolean; source: string; error?: string }> {
  const radiusMetres = Math.min(Math.round(radiusKm * 1000), 20000); // capped at 20km
  const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}_${radiusMetres}_${categoryIds.sort().join(',')}`;

  const cached = overpassCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      businesses: cached.data,
      cached: true,
      source: 'Memory Cache (Overpass)',
    };
  }

  const query = buildOverpassQuery(lat, lon, radiusMetres, categoryIds);
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  let rawJson: any = null;
  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'FastPace-LocalSalesOS/1.0',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        rawJson = await res.json();
        if (rawJson && rawJson.elements) {
          break; // successfully fetched
        }
      } else {
        lastError = new Error(`Overpass returned status ${res.status}`);
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!rawJson || !Array.isArray(rawJson.elements)) {
    console.warn('Overpass API query failed or timed out:', lastError);
    return {
      businesses: [],
      cached: false,
      source: 'Overpass API',
      error: 'OpenStreetMap query is taking longer than usual. Please try a slightly smaller radius or try again in a few moments.',
    };
  }

  const parsedBusinesses = parseAndDeduplicateOverpassElements(rawJson.elements, lat, lon);

  // Cache the valid response
  overpassCache.set(cacheKey, {
    timestamp: Date.now(),
    data: parsedBusinesses,
  });

  return {
    businesses: parsedBusinesses,
    cached: false,
    source: 'Overpass API',
  };
}

const GENERIC_NAMES_BLACKLIST = new Set([
  'restaurant', 'cafe', 'coffee shop', 'hotel', 'shop', 'salon', 'clinic', 'gym', 'school', 'boutique',
  'unnamed', 'anonymous', 'unknown', 'business', 'store', 'fast food', 'juice shop', 'juice bar',
  'dentist', 'doctors', 'hairdresser', 'beauty salon', 'supermarket', 'bakery', 'chemist', 'pharmacy',
  'bar', 'pub', 'spa', 'massage', 'laundry', 'dry cleaning', 'bank', 'atm', 'toilets', 'public toilets',
  'public toilet', 'parking', 'bench', 'trash bin', 'waste basket', 'waste bin', 'drinking water',
  'water tap', 'bus stop', 'metro station', 'subway station', 'transformer', 'water pump', 'street light',
  'junction', 'roundabout', 'traffic light', 'electricity pole', 'generator'
]);

const NAME_JUNK_WORDS = [
  'toilet', 'parking', 'bench', 'atm', 'trash', 'waste', 'bus stop', 'metro station', 'subway station',
  'transformer', 'water pump', 'water tap', 'drinking water', 'street light', 'junction', 'roundabout',
  'traffic light', 'electricity pole', 'generator', 'street light', 'pole', 'road', 'street', 'bridge',
  'flyover', 'dustbin', 'garbage', 'bin', 'public restroom', 'restroom', 'urinal', 'electric box'
];

const JUNK_AMENITIES = new Set([
  'toilets', 'waste_basket', 'bench', 'drinking_water', 'waste_disposal', 'telephone',
  'post_box', 'recycling', 'bicycle_parking', 'water_point', 'shelter', 'parking',
  'parking_space', 'atm', 'vending_machine', 'charging_station', 'waste_transfer_station'
]);

function parseAndDeduplicateOverpassElements(
  elements: any[],
  centerLat: number,
  centerLon: number
): RawDiscoveredBusiness[] {
  const seenIds = new Set<string>();
  const seenNameCoords = new Set<string>();
  const results: RawDiscoveredBusiness[] = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags['name:en'] || tags.brand;
    if (!name || name.trim().length < 3) continue; // skip unnamed or extremely short features

    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();

    // 1. Skip obvious infrastructure or natural tags
    if (tags.natural || tags.highway || tags.railway || tags.power || tags.barrier || tags.boundary) {
      continue;
    }

    // 2. Skip municipal amenities
    if (tags.amenity && JUNK_AMENITIES.has(tags.amenity)) {
      continue;
    }

    // 3. Skip generic blacklisted names
    if (GENERIC_NAMES_BLACKLIST.has(lowerName)) {
      continue;
    }

    // 4. Skip names containing junk words
    if (NAME_JUNK_WORDS.some(word => lowerName.includes(word))) {
      continue;
    }

    const osmId = `${el.type}_${el.id}`;
    if (seenIds.has(osmId)) continue;
    seenIds.add(osmId);

    const lat = el.lat || el.center?.lat;
    const lon = el.lon || el.center?.lon;
    if (!lat || !lon) continue;

    // Deduplicate by normalized name + rough coordinate grid (approx 30m)
    const normalizedName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const coordKey = `${normalizedName}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (seenNameCoords.has(coordKey)) continue;
    seenNameCoords.add(coordKey);

    const distanceKm = calculateHaversineDistanceKm(centerLat, centerLon, lat, lon);

    // Map Category
    let category = 'Other';
    let subcategory = tags.cuisine || tags.healthcare || tags.service || undefined;

    for (const cat of CATEGORIES) {
      for (const t of cat.osmTags) {
        if (tags[t.key] === t.value) {
          category = cat.name;
          break;
        }
      }
      if (category !== 'Other') break;
    }

    if (category === 'Other') {
      if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') category = 'Restaurants';
      else if (tags.amenity === 'cafe') category = 'Cafes';
      else if (tags.amenity === 'clinic' || tags.amenity === 'doctors') category = 'Clinics';
      else if (tags.shop === 'hairdresser' || tags.shop === 'beauty') category = 'Salons';
      else if (tags.leisure === 'fitness_centre') category = 'Gyms';
      else category = 'Local Business';
    }

    // Build Address
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'] || tags['addr:district'],
      tags['addr:city'],
    ].filter(Boolean);

    const address = addressParts.length > 0 ? addressParts.join(', ') : undefined;
    const area = tags['addr:suburb'] || tags['addr:district'] || tags['addr:neighbourhood'] || undefined;
    const city = tags['addr:city'] || undefined;

    const phone =
      tags.phone ||
      tags['contact:phone'] ||
      tags['contact:mobile'] ||
      tags.mobile ||
      tags['phone:mobile'] ||
      undefined;

    let website =
      tags.website ||
      tags['contact:website'] ||
      tags['url'] ||
      tags['contact:instagram'] ||
      undefined;

    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      website = `https://${website}`;
    }

    const email = tags.email || tags['contact:email'] || undefined;
    const openingHours = tags.opening_hours || undefined;

    // 5. Skip names identical to categories if there are no contact details
    const hasContactDetails = Boolean(phone || website || email);
    if (!hasContactDetails) {
      const lowerCat = category.toLowerCase();
      const lowerSub = subcategory?.toLowerCase() || '';
      
      if (
        lowerName === lowerCat || 
        lowerName === lowerCat.replace(/s$/, '') || 
        (lowerSub && lowerName === lowerSub)
      ) {
        continue;
      }
    }

    const mapsUrl = `https://www.openstreetmap.org/${el.type}/${el.id}`;

    results.push({
      osmId,
      name: cleanName,
      category,
      subcategory,
      address,
      area,
      city,
      latitude: lat,
      longitude: lon,
      distanceKm,
      phone,
      website,
      email,
      openingHours,
      mapsUrl,
      rawTags: tags,
    });
  }

  // Sort default: closest distance first
  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}
