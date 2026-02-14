export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  host: process.env.HOST || "0.0.0.0",
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || "",
  looksmappingUrl:
    process.env.LOOKSMAPPING_URL ||
    "https://walzr.com/looksmapping/places_sf.geojson.gz",
  sqlitePath: process.env.SQLITE_PATH || "./tresty-cache.db",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
