import { config } from "../config.js";
import { CacheService } from "./cache.js";

interface PlaceSearchResult {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    photos?: Array<{ name: string }>;
    rating?: number;
    userRatingCount?: number;
    location?: { latitude: number; longitude: number };
  }>;
}

export class GooglePlacesService {
  private cache: CacheService;

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  async getPhotoUrl(
    restaurantId: string,
    name: string,
    neighborhood: string,
    lat: number,
    lng: number,
    photoIndex: number = 0
  ): Promise<string | null> {
    const cacheKey = `${restaurantId}:${photoIndex}`;

    const cached = this.cache.getPhoto(cacheKey);
    if (cached !== null) {
      return cached;
    }

    if (!config.googlePlacesApiKey) {
      return null;
    }

    try {
      const result = await this.searchPlace(name, neighborhood, lat, lng);
      if (!result) {
        this.cache.setPhoto(cacheKey, null, null);
        return null;
      }

      // Cache rating + photo count when we find the place
      const photoCount = result.photos?.length ?? 0;
      this.cache.setDetails(
        restaurantId,
        result.rating ?? null,
        result.userRatingCount ?? null,
        result.id,
        photoCount
      );

      if (!result.photos?.length) {
        this.cache.setPhoto(cacheKey, null, null);
        return null;
      }

      // Cache ALL photo URLs from this result
      for (let i = 0; i < result.photos.length; i++) {
        const photoName = result.photos[i].name;
        const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${config.googlePlacesApiKey}`;
        this.cache.setPhoto(`${restaurantId}:${i}`, url, result.id);
      }

      // Return the requested index
      if (photoIndex >= result.photos.length) {
        return null;
      }

      return this.cache.getPhoto(cacheKey);
    } catch (error) {
      console.error(`Failed to get photo for ${name}:`, error);
      return null;
    }
  }

  async getDetails(
    restaurantId: string,
    name: string,
    neighborhood: string,
    lat: number,
    lng: number
  ): Promise<{ rating: number | null; userRatingCount: number | null; photoCount: number }> {
    // Check cache first
    const cached = this.cache.getDetails(restaurantId);
    if (cached !== null) {
      return cached;
    }

    if (!config.googlePlacesApiKey) {
      return { rating: null, userRatingCount: null, photoCount: 0 };
    }

    try {
      const result = await this.searchPlace(name, neighborhood, lat, lng);
      const rating = result?.rating ?? null;
      const count = result?.userRatingCount ?? null;
      const photoCount = result?.photos?.length ?? 0;
      this.cache.setDetails(restaurantId, rating, count, result?.id ?? null, photoCount);

      // Also cache all photo URLs while we have them
      if (result?.photos) {
        for (let i = 0; i < result.photos.length; i++) {
          const photoName = result.photos[i].name;
          const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${config.googlePlacesApiKey}`;
          this.cache.setPhoto(`${restaurantId}:${i}`, url, result.id);
        }
      }

      return { rating, userRatingCount: count, photoCount };
    } catch (error) {
      console.error(`Failed to get details for ${name}:`, error);
      return { rating: null, userRatingCount: null, photoCount: 0 };
    }
  }

  private async searchPlace(
    name: string,
    neighborhood: string,
    lat: number,
    lng: number
  ) {
    const query = `"${name}" restaurant ${neighborhood} San Francisco`;

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": config.googlePlacesApiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.photos,places.rating,places.userRatingCount,places.location",
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 200.0,
            },
          },
          maxResultCount: 3,
        }),
      }
    );

    if (!response.ok) {
      console.error(`Places API error: ${response.status}`);
      return null;
    }

    const data: PlaceSearchResult = await response.json();

    if (!data.places?.length) {
      return null;
    }

    return this.findBestMatch(data.places, name, lat, lng);
  }

  private findBestMatch(
    places: NonNullable<PlaceSearchResult["places"]>,
    targetName: string,
    targetLat: number,
    targetLng: number
  ) {
    let bestPlace = places[0];
    let bestScore = -1;

    for (const place of places) {
      let score = 0;

      if (place.displayName?.text) {
        const similarity = this.nameSimilarity(
          targetName.toLowerCase(),
          place.displayName.text.toLowerCase()
        );
        score += similarity * 10;
      }

      if (place.location) {
        const dist = this.haversineDistance(
          targetLat,
          targetLng,
          place.location.latitude,
          place.location.longitude
        );
        score += Math.max(0, 5 - dist / 100);
      }

      if (score > bestScore) {
        bestScore = score;
        bestPlace = place;
      }
    }

    return bestPlace;
  }

  private nameSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    let matches = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) matches++;
    }
    return matches / Math.max(wordsA.size, wordsB.size);
  }

  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
