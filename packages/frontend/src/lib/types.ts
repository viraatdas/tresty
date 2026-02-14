// Re-export shared types for frontend use
// These mirror @tresty/shared types but are defined locally
// to avoid workspace dependency issues with Next.js

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  location: {
    lat: number;
    lng: number;
  };
  attractiveScore: number;
  ageScore: number;
  genderScore: number;
  faces: number;
  photoUrl: string | null;
}

export type SwipeAction = "want_to_go" | "not_interested" | "been_there";

export interface SwipeRecord {
  restaurantId: string;
  restaurantName: string;
  category: string;
  neighborhood: string;
  action: SwipeAction;
  timestamp: number;
}

export interface RestaurantListResponse {
  restaurants: Restaurant[];
  total: number;
  hasMore: boolean;
}

export interface MetaResponse {
  values: string[];
}

export interface HealthResponse {
  status: "ok";
  restaurantCount: number;
  timestamp: string;
}
