"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import TinderCard from "react-tinder-card";
import type { Restaurant, SwipeAction } from "@/lib/types";
import { getRestaurants } from "@/lib/api";
import { addSwipeRecord, getSwipedIds, clearNotInterested } from "@/lib/storage";
import SwipeCard from "./SwipeCard";
import SwipeActions from "./SwipeActions";
import SwipeOverlay from "./SwipeOverlay";

type Direction = "left" | "right" | "up" | "down";

interface CardAPI {
  swipe(dir?: Direction): Promise<void>;
  restoreCard(): Promise<void>;
}

const BUFFER_SIZE = 20;
const REFETCH_THRESHOLD = 5;

function directionToAction(dir: string): SwipeAction {
  switch (dir) {
    case "left":
      return "not_interested";
    case "right":
      return "want_to_go";
    case "up":
      return "been_there";
    default:
      return "not_interested";
  }
}

export default function SwipeDeck() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | "up" | null>(null);
  const [swipeOpacity, setSwipeOpacity] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const fetchingRef = useRef(false);
  const cardRefs = useRef<Array<CardAPI | null>>([]);
  const topCardRef = useRef<{ cyclePhoto: () => void } | null>(null);

  const fetchMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const excludeIds = getSwipedIds();
      const res = await getRestaurants({
        limit: BUFFER_SIZE,
        exclude: excludeIds,
        sortBy: "random",
      });
      setRestaurants((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newOnes = res.restaurants.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newOnes];
      });
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMore();
  }, [fetchMore]);

  // Keyboard controls: arrows + spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (restaurants.length === 0) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handleButtonSwipe("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleButtonSwipe("right");
          break;
        case "ArrowUp":
          e.preventDefault();
          handleButtonSwipe("up");
          break;
        case " ":
          e.preventDefault();
          topCardRef.current?.cyclePhoto();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSwipe = useCallback(
    (direction: Direction, restaurant: Restaurant) => {
      const action = directionToAction(direction);
      addSwipeRecord(
        restaurant.id,
        restaurant.name,
        restaurant.category,
        restaurant.neighborhood,
        action
      );
      setSwipedCount((c) => c + 1);
      setSwipeDir(null);
      setSwipeOpacity(0);
    },
    []
  );

  const handleCardLeftScreen = useCallback(
    (restaurantId: string) => {
      setRestaurants((prev) => {
        const updated = prev.filter((r) => r.id !== restaurantId);
        if (updated.length < REFETCH_THRESHOLD) {
          fetchMore();
        }
        return updated;
      });
    },
    [fetchMore]
  );

  const handleButtonSwipe = useCallback(
    async (direction: "left" | "right" | "up") => {
      if (restaurants.length === 0) return;
      const ref = cardRefs.current[0];
      if (ref) {
        await ref.swipe(direction);
      }
    },
    [restaurants]
  );

  const visibleCards = restaurants.slice(0, 3);

  if (loading && restaurants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Finding restaurants...</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="text-6xl animate-pop-in">{"\uD83C\uDF89"}</div>
        <h2 className="text-xl font-bold text-gray-800">
          You&apos;ve seen them all!
        </h2>
        <p className="text-gray-400 text-sm">
          You swiped through {swipedCount} restaurants.
        </p>
        <button
          onClick={() => {
            clearNotInterested();
            setSwipedCount(0);
            fetchMore();
          }}
          className="mt-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-semibold rounded-full text-sm active:scale-95 transition-transform"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Card stack */}
      <div className="flex-1 relative mx-3 my-1" style={{ minHeight: 420 }}>
        {visibleCards
          .map((restaurant, index) => (
            <TinderCard
              key={restaurant.id}
              ref={(el: CardAPI | null) => {
                cardRefs.current[index] = el;
              }}
              onSwipe={(dir: Direction) => handleSwipe(dir, restaurant)}
              onCardLeftScreen={() => handleCardLeftScreen(restaurant.id)}
              onSwipeRequirementFulfilled={(dir: Direction) => {
                setSwipeDir(dir as "left" | "right" | "up");
                setSwipeOpacity(1);
              }}
              onSwipeRequirementUnfulfilled={() => {
                setSwipeDir(null);
                setSwipeOpacity(0);
              }}
              preventSwipe={["down"]}
              swipeRequirementType="position"
              swipeThreshold={80}
              className="absolute inset-0"
            >
              <SwipeCard
                restaurant={restaurant}
                index={index}
                ref={index === 0 ? topCardRef : undefined}
              />
              {index === 0 && (
                <SwipeOverlay direction={swipeDir} opacity={swipeOpacity} />
              )}
            </TinderCard>
          ))
          .reverse()}
      </div>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-4 text-[10px] text-gray-300 font-medium">
        <span>{"\u2190"} nope</span>
        <span>{"\u2191"} been</span>
        <span>{"\u2192"} want</span>
        <span>space = photos</span>
      </div>

      {/* Action buttons */}
      <SwipeActions
        onSwipe={handleButtonSwipe}
        disabled={restaurants.length === 0}
      />
    </div>
  );
}
