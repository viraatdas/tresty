import type { FastifyInstance } from "fastify";
import { LooksmappingService } from "../services/looksmapping.js";
import { GooglePlacesService } from "../services/google-places.js";

export function registerPhotoRoutes(
  app: FastifyInstance,
  looksmapping: LooksmappingService,
  googlePlaces: GooglePlacesService
) {
  // GET /api/restaurants/:id/photo?index=N — proxy Google Places photo
  app.get<{ Params: { id: string }; Querystring: { index?: string } }>(
    "/api/restaurants/:id/photo",
    async (request, reply) => {
      const restaurant = looksmapping.getById(request.params.id);
      if (!restaurant) {
        return reply.status(404).send({ error: "Restaurant not found" });
      }

      const photoIndex = parseInt(request.query.index || "0", 10);

      const photoUrl = await googlePlaces.getPhotoUrl(
        restaurant.id,
        restaurant.name,
        restaurant.neighborhood,
        restaurant.location.lat,
        restaurant.location.lng,
        photoIndex
      );

      if (!photoUrl) {
        return reply.status(404).send({ error: "No photo available" });
      }

      return reply.redirect(photoUrl);
    }
  );

  // GET /api/restaurants/:id/details — Google Places rating + photo count
  app.get<{ Params: { id: string } }>(
    "/api/restaurants/:id/details",
    async (request, reply) => {
      const restaurant = looksmapping.getById(request.params.id);
      if (!restaurant) {
        return reply.status(404).send({ error: "Restaurant not found" });
      }

      const details = await googlePlaces.getDetails(
        restaurant.id,
        restaurant.name,
        restaurant.neighborhood,
        restaurant.location.lat,
        restaurant.location.lng
      );

      return details;
    }
  );
}
