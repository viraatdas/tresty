import type { SwipeAction, SwipeRecord } from "./types";

const STORAGE_KEY = "tresty_actions";

function getRecords(): SwipeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: SwipeRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addSwipeRecord(
  restaurantId: string,
  restaurantName: string,
  category: string,
  neighborhood: string,
  action: SwipeAction
): void {
  const records = getRecords();
  // Remove existing record for this restaurant if any
  const filtered = records.filter((r) => r.restaurantId !== restaurantId);
  filtered.push({
    restaurantId,
    restaurantName,
    category,
    neighborhood,
    action,
    timestamp: Date.now(),
  });
  saveRecords(filtered);
}

export function removeSwipeRecord(restaurantId: string): void {
  const records = getRecords();
  saveRecords(records.filter((r) => r.restaurantId !== restaurantId));
}

export function getSwipeRecords(action?: SwipeAction): SwipeRecord[] {
  const records = getRecords();
  if (action) return records.filter((r) => r.action === action);
  return records;
}

export function getSwipedIds(): string[] {
  return getRecords().map((r) => r.restaurantId);
}

export function hasBeenSwiped(restaurantId: string): boolean {
  return getRecords().some((r) => r.restaurantId === restaurantId);
}

export function clearNotInterested(): void {
  const records = getRecords();
  saveRecords(records.filter((r) => r.action !== "not_interested"));
}
