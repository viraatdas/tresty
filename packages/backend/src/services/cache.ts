import Database from "better-sqlite3";
import { config } from "../config.js";

export class CacheService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(config.sqlitePath);
    this.db.pragma("journal_mode = WAL");
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS photo_cache (
        restaurant_id TEXT PRIMARY KEY,
        photo_url TEXT,
        place_id TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS details_cache (
        restaurant_id TEXT PRIMARY KEY,
        rating REAL,
        user_rating_count INTEGER,
        place_id TEXT,
        photo_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);
    // Add photo_count column if missing (migration for existing DBs)
    try {
      this.db.exec(`ALTER TABLE details_cache ADD COLUMN photo_count INTEGER DEFAULT 0`);
    } catch {
      // Column already exists
    }
  }

  getPhoto(restaurantId: string): string | null {
    const row = this.db
      .prepare(
        "SELECT photo_url FROM photo_cache WHERE restaurant_id = ? AND expires_at > ?"
      )
      .get(restaurantId, Date.now()) as { photo_url: string } | undefined;
    return row?.photo_url ?? null;
  }

  setPhoto(
    restaurantId: string,
    photoUrl: string | null,
    placeId: string | null
  ): void {
    const ttl = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.db
      .prepare(
        `INSERT OR REPLACE INTO photo_cache (restaurant_id, photo_url, place_id, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(restaurantId, photoUrl, placeId, Date.now(), Date.now() + ttl);
  }

  getDetails(restaurantId: string): { rating: number | null; userRatingCount: number | null; photoCount: number } | null {
    const row = this.db
      .prepare(
        "SELECT rating, user_rating_count, photo_count FROM details_cache WHERE restaurant_id = ? AND expires_at > ?"
      )
      .get(restaurantId, Date.now()) as { rating: number | null; user_rating_count: number | null; photo_count: number | null } | undefined;
    if (!row) return null;
    return { rating: row.rating, userRatingCount: row.user_rating_count, photoCount: row.photo_count ?? 0 };
  }

  setDetails(
    restaurantId: string,
    rating: number | null,
    userRatingCount: number | null,
    placeId: string | null,
    photoCount: number = 0
  ): void {
    const ttl = 7 * 24 * 60 * 60 * 1000;
    this.db
      .prepare(
        `INSERT OR REPLACE INTO details_cache (restaurant_id, rating, user_rating_count, place_id, photo_count, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(restaurantId, rating, userRatingCount, placeId, photoCount, Date.now(), Date.now() + ttl);
  }

  close(): void {
    this.db.close();
  }
}
