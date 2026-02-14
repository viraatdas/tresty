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
  action: SwipeAction;
  timestamp: number;
}

export interface RestaurantListRequest {
  limit?: number;
  offset?: number;
  exclude?: string[];
  sortBy?: "random" | "attractive" | "name";
  category?: string;
  neighborhood?: string;
}

export interface RestaurantListResponse {
  restaurants: Restaurant[];
  total: number;
  hasMore: boolean;
}

export interface TopRestaurantsRequest {
  limit?: number;
  minFaces?: number;
  category?: string;
  neighborhood?: string;
}

export interface MetaResponse {
  values: string[];
}

export interface HealthResponse {
  status: "ok";
  restaurantCount: number;
  timestamp: string;
}
