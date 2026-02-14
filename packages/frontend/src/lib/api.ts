import type {
  Restaurant,
  RestaurantListResponse,
  MetaResponse,
  HealthResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getRestaurants(params: {
  limit?: number;
  offset?: number;
  exclude?: string[];
  sortBy?: string;
  category?: string;
  neighborhood?: string;
}): Promise<RestaurantListResponse> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  if (params.exclude?.length)
    searchParams.set("exclude", params.exclude.join(","));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.category) searchParams.set("category", params.category);
  if (params.neighborhood)
    searchParams.set("neighborhood", params.neighborhood);

  return fetchJson(`/api/restaurants?${searchParams}`);
}

export async function getTopRestaurants(params?: {
  limit?: number;
  minFaces?: number;
  category?: string;
  neighborhood?: string;
}): Promise<RestaurantListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.minFaces) searchParams.set("minFaces", String(params.minFaces));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.neighborhood)
    searchParams.set("neighborhood", params.neighborhood);

  return fetchJson(`/api/restaurants/top?${searchParams}`);
}

export async function getRestaurant(id: string): Promise<Restaurant> {
  return fetchJson(`/api/restaurants/${id}`);
}

export function getPhotoUrl(id: string, index: number = 0): string {
  return `${API_URL}/api/restaurants/${id}/photo?index=${index}`;
}

export async function getCategories(): Promise<MetaResponse> {
  return fetchJson("/api/meta/categories");
}

export async function getNeighborhoods(): Promise<MetaResponse> {
  return fetchJson("/api/meta/neighborhoods");
}

export async function getRestaurantDetails(
  id: string
): Promise<{ rating: number | null; userRatingCount: number | null; photoCount: number }> {
  return fetchJson(`/api/restaurants/${id}/details`);
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchJson("/api/health");
}
