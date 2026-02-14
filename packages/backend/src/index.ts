import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import cron from "node-cron";
import { config } from "./config.js";
import { LooksmappingService } from "./services/looksmapping.js";
import { CacheService } from "./services/cache.js";
import { GooglePlacesService } from "./services/google-places.js";
import { registerRestaurantRoutes } from "./routes/restaurants.js";
import { registerPhotoRoutes } from "./routes/photos.js";

const app = Fastify({ logger: true });

async function main() {
  // CORS — allow configured origin + any Vercel preview URLs
  await app.register(cors, {
    origin: (origin, cb) => {
      if (
        !origin ||
        origin === config.corsOrigin ||
        origin.endsWith(".vercel.app") ||
        origin === "http://localhost:3000"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  // Rate limiting on photo endpoint
  await app.register(rateLimit, {
    max: 10,
    timeWindow: 1000,
    keyGenerator: (request) => request.ip,
    hook: "onRequest",
  });

  // Initialize services
  const looksmapping = new LooksmappingService();
  const cache = new CacheService();
  const googlePlaces = new GooglePlacesService(cache);

  // Fetch data on startup
  await looksmapping.fetchAndParse();

  // Register routes
  registerRestaurantRoutes(app, looksmapping);
  registerPhotoRoutes(app, looksmapping, googlePlaces);

  // Refresh data every 24 hours
  cron.schedule("0 0 * * *", async () => {
    console.log("Refreshing restaurant data...");
    try {
      await looksmapping.fetchAndParse();
      console.log("Restaurant data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh restaurant data:", error);
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    cache.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Start server
  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running on http://${config.host}:${config.port}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
