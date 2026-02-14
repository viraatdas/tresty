import { createHash } from "crypto";
import { gunzipSync } from "zlib";
import type { Restaurant } from "@tresty/shared";
import { config } from "../config.js";

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    name: string;
    category: string;
    hood?: string;
    age_score: number;
    attractive_score: number;
    gender_score: number;
    faces: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

function generateId(name: string, lat: number, lng: number): string {
  const input = `${name}:${lat}:${lng}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 12);
}

function inferNeighborhood(lat: number, lng: number): string {
  // Simple SF neighborhood inference based on coordinates
  const neighborhoods: { name: string; lat: number; lng: number; radius: number }[] = [
    { name: "Marina", lat: 37.8015, lng: -122.4368, radius: 0.012 },
    { name: "Pacific Heights", lat: 37.7925, lng: -122.4350, radius: 0.010 },
    { name: "Russian Hill", lat: 37.8011, lng: -122.4194, radius: 0.008 },
    { name: "North Beach", lat: 37.8060, lng: -122.4103, radius: 0.010 },
    { name: "Chinatown", lat: 37.7941, lng: -122.4078, radius: 0.006 },
    { name: "Financial District", lat: 37.7946, lng: -122.3999, radius: 0.008 },
    { name: "SoMa", lat: 37.7785, lng: -122.3950, radius: 0.015 },
    { name: "Mission", lat: 37.7599, lng: -122.4148, radius: 0.015 },
    { name: "Castro", lat: 37.7609, lng: -122.4350, radius: 0.008 },
    { name: "Noe Valley", lat: 37.7502, lng: -122.4337, radius: 0.010 },
    { name: "Hayes Valley", lat: 37.7759, lng: -122.4245, radius: 0.008 },
    { name: "Haight-Ashbury", lat: 37.7692, lng: -122.4481, radius: 0.010 },
    { name: "Richmond", lat: 37.7800, lng: -122.4784, radius: 0.020 },
    { name: "Sunset", lat: 37.7600, lng: -122.4900, radius: 0.020 },
    { name: "Tenderloin", lat: 37.7847, lng: -122.4141, radius: 0.008 },
    { name: "Nob Hill", lat: 37.7930, lng: -122.4161, radius: 0.008 },
    { name: "Japantown", lat: 37.7854, lng: -122.4295, radius: 0.006 },
    { name: "Potrero Hill", lat: 37.7610, lng: -122.3928, radius: 0.010 },
    { name: "Dogpatch", lat: 37.7580, lng: -122.3870, radius: 0.008 },
    { name: "Bernal Heights", lat: 37.7390, lng: -122.4150, radius: 0.010 },
    { name: "Fisherman's Wharf", lat: 37.8080, lng: -122.4177, radius: 0.008 },
    { name: "Union Square", lat: 37.7880, lng: -122.4075, radius: 0.006 },
    { name: "Embarcadero", lat: 37.7955, lng: -122.3930, radius: 0.008 },
    { name: "Outer Sunset", lat: 37.7550, lng: -122.5050, radius: 0.015 },
    { name: "Inner Sunset", lat: 37.7620, lng: -122.4650, radius: 0.010 },
    { name: "Cole Valley", lat: 37.7660, lng: -122.4510, radius: 0.006 },
    { name: "Glen Park", lat: 37.7340, lng: -122.4330, radius: 0.008 },
    { name: "Excelsior", lat: 37.7230, lng: -122.4250, radius: 0.010 },
    { name: "Bayview", lat: 37.7300, lng: -122.3900, radius: 0.012 },
    { name: "Presidio Heights", lat: 37.7880, lng: -122.4520, radius: 0.008 },
    { name: "Lower Haight", lat: 37.7720, lng: -122.4310, radius: 0.005 },
    { name: "Western Addition", lat: 37.7810, lng: -122.4380, radius: 0.008 },
    { name: "Fillmore", lat: 37.7850, lng: -122.4350, radius: 0.006 },
  ];

  let closest = "San Francisco";
  let minDist = Infinity;

  for (const n of neighborhoods) {
    const dist = Math.sqrt((lat - n.lat) ** 2 + (lng - n.lng) ** 2);
    if (dist < n.radius && dist < minDist) {
      minDist = dist;
      closest = n.name;
    }
  }

  return closest;
}

export class LooksmappingService {
  private restaurantsById = new Map<string, Restaurant>();
  private sortedByAttractiveness: Restaurant[] = [];
  private allCategories = new Set<string>();
  private allNeighborhoods = new Set<string>();

  async fetchAndParse(): Promise<void> {
    console.log("Fetching GeoJSON from looksmapping...");
    const response = await fetch(config.looksmappingUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const decompressed = gunzipSync(buffer);
    const geojson: GeoJSONCollection = JSON.parse(decompressed.toString("utf-8"));

    console.log(`Parsed ${geojson.features.length} restaurants`);

    const newMap = new Map<string, Restaurant>();
    const categories = new Set<string>();
    const neighborhoods = new Set<string>();

    for (const feature of geojson.features) {
      const { properties, geometry } = feature;
      const [lng, lat] = geometry.coordinates;
      const id = generateId(properties.name, lat, lng);
      const neighborhood = properties.hood || inferNeighborhood(lat, lng);

      const restaurant: Restaurant = {
        id,
        name: properties.name,
        category: properties.category,
        neighborhood,
        location: { lat, lng },
        attractiveScore: properties.attractive_score,
        ageScore: properties.age_score,
        genderScore: properties.gender_score,
        faces: properties.faces,
        photoUrl: null,
      };

      newMap.set(id, restaurant);
      categories.add(properties.category);
      neighborhoods.add(neighborhood);
    }

    this.restaurantsById = newMap;
    this.sortedByAttractiveness = [...newMap.values()].sort(
      (a, b) => b.attractiveScore - a.attractiveScore
    );
    this.allCategories = categories;
    this.allNeighborhoods = neighborhoods;

    console.log(
      `Indexed ${newMap.size} restaurants, ${categories.size} categories, ${neighborhoods.size} neighborhoods`
    );
  }

  getById(id: string): Restaurant | undefined {
    return this.restaurantsById.get(id);
  }

  getAll(): Map<string, Restaurant> {
    return this.restaurantsById;
  }

  getTopByAttractiveness(): Restaurant[] {
    return this.sortedByAttractiveness;
  }

  getCategories(): string[] {
    return [...this.allCategories].sort();
  }

  getNeighborhoods(): string[] {
    return [...this.allNeighborhoods].sort();
  }

  getCount(): number {
    return this.restaurantsById.size;
  }
}
