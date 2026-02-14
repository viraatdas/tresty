import type { FastifyInstance } from "fastify";
import type { Restaurant } from "@tresty/shared";
import { LooksmappingService } from "../services/looksmapping.js";

export function registerRestaurantRoutes(
  app: FastifyInstance,
  looksmapping: LooksmappingService
) {
  // GET /api/restaurants — paginated list
  app.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      exclude?: string;
      sortBy?: string;
      category?: string;
      neighborhood?: string;
    };
  }>("/api/restaurants", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const excludeSet = new Set(
      request.query.exclude ? request.query.exclude.split(",") : []
    );
    const sortBy = request.query.sortBy || "random";
    const categoryFilter = request.query.category;
    const neighborhoodFilter = request.query.neighborhood;

    let restaurants = [...looksmapping.getAll().values()];

    // Filter excluded
    if (excludeSet.size > 0) {
      restaurants = restaurants.filter((r) => !excludeSet.has(r.id));
    }

    // Filter by category
    if (categoryFilter) {
      restaurants = restaurants.filter((r) => r.category === categoryFilter);
    }

    // Filter by neighborhood
    if (neighborhoodFilter) {
      restaurants = restaurants.filter(
        (r) => r.neighborhood === neighborhoodFilter
      );
    }

    const total = restaurants.length;

    // Sort
    if (sortBy === "random") {
      shuffleArray(restaurants);
    } else if (sortBy === "attractive") {
      restaurants.sort((a, b) => b.attractiveScore - a.attractiveScore);
    } else if (sortBy === "name") {
      restaurants.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Paginate
    const paginated = restaurants.slice(offset, offset + limit);

    return {
      restaurants: paginated,
      total,
      hasMore: offset + limit < total,
    };
  });

  // GET /api/restaurants/top — sorted by attractiveScore desc
  app.get<{
    Querystring: {
      limit?: string;
      minFaces?: string;
      category?: string;
      neighborhood?: string;
    };
  }>("/api/restaurants/top", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 200);
    const minFaces = parseInt(request.query.minFaces || "10", 10);
    const categoryFilter = request.query.category;
    const neighborhoodFilter = request.query.neighborhood;

    let restaurants = looksmapping.getTopByAttractiveness();

    // Filter by minimum faces
    restaurants = restaurants.filter((r) => r.faces >= minFaces);

    // Filter by category
    if (categoryFilter) {
      restaurants = restaurants.filter((r) => r.category === categoryFilter);
    }

    // Filter by neighborhood
    if (neighborhoodFilter) {
      restaurants = restaurants.filter(
        (r) => r.neighborhood === neighborhoodFilter
      );
    }

    return {
      restaurants: restaurants.slice(0, limit),
      total: restaurants.length,
      hasMore: restaurants.length > limit,
    };
  });

  // GET /api/restaurants/:id — single restaurant
  app.get<{ Params: { id: string } }>(
    "/api/restaurants/:id",
    async (request, reply) => {
      const restaurant = looksmapping.getById(request.params.id);
      if (!restaurant) {
        return reply.status(404).send({ error: "Restaurant not found" });
      }
      return restaurant;
    }
  );

  // GET /api/meta/categories
  app.get("/api/meta/categories", async () => {
    return { values: looksmapping.getCategories() };
  });

  // GET /api/meta/neighborhoods
  app.get("/api/meta/neighborhoods", async () => {
    return { values: looksmapping.getNeighborhoods() };
  });

  // GET /api/health
  app.get("/api/health", async () => {
    return {
      status: "ok" as const,
      restaurantCount: looksmapping.getCount(),
      timestamp: new Date().toISOString(),
    };
  });
}

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
