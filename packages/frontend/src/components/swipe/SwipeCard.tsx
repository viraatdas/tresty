"use client";

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { Restaurant } from "@/lib/types";
import { getPhotoUrl, getRestaurantDetails } from "@/lib/api";

interface SwipeCardProps {
  restaurant: Restaurant;
  index: number;
  onPhotoIndexChange?: (index: number) => void;
}

export interface SwipeCardRef {
  cyclePhoto: () => void;
}

const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  function SwipeCard({ restaurant, index, onPhotoIndexChange }, ref) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const [imgError, setImgError] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [ratingCount, setRatingCount] = useState<number | null>(null);
    const [photoCount, setPhotoCount] = useState(1);
    const scale = 1 - index * 0.04;
    const translateY = index * 10;

    // Fetch details (rating + photo count) on mount
    useEffect(() => {
      let cancelled = false;
      getRestaurantDetails(restaurant.id)
        .then((details) => {
          if (!cancelled) {
            setRating(details.rating);
            setRatingCount(details.userRatingCount);
            if (details.photoCount > 0) {
              setPhotoCount(details.photoCount);
            }
          }
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [restaurant.id]);

    const cyclePhoto = useCallback(
      (direction: 1 | -1 = 1) => {
        setPhotoIndex((prev) => {
          const next = (prev + direction + photoCount) % photoCount;
          onPhotoIndexChange?.(next);
          return next;
        });
        setImgError(false);
      },
      [photoCount, onPhotoIndexChange]
    );

    useImperativeHandle(ref, () => ({ cyclePhoto: () => cyclePhoto(1) }), [cyclePhoto]);

    const scorePercent = (restaurant.attractiveScore / 10) * 100;

    return (
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden bg-white animate-slide-in-up"
        style={{
          transform: `scale(${scale}) translateY(${translateY}px)`,
          zIndex: 10 - index,
          boxShadow:
            index === 0
              ? "0 10px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.08)"
              : "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Photo area */}
        <div className="relative h-[68%] bg-gray-100">
          {/* Tap zones for photo navigation */}
          <div
            className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              cyclePhoto(-1);
            }}
          />
          <div
            className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              cyclePhoto(1);
            }}
          />

          {!imgError ? (
            <img
              key={`${restaurant.id}-${photoIndex}`}
              src={getPhotoUrl(restaurant.id, photoIndex)}
              alt={`${restaurant.name} - photo ${photoIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-200"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
              <span className="text-6xl">{"\uD83C\uDF7D\uFE0F"}</span>
            </div>
          )}

          {/* Photo indicator bars (Tinder-style) */}
          {photoCount > 1 && (
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
              {Array.from({ length: photoCount }).map((_, i) => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 rounded-full transition-all duration-200 ${
                    i === photoIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/60 to-transparent" />

          {/* Photo counter badge */}
          {photoCount > 1 && (
            <div className="absolute bottom-16 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-20">
              {photoIndex + 1} / {photoCount}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="h-[32%] px-5 pt-1 pb-3 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-[22px] font-bold text-gray-900 truncate leading-tight">
                {restaurant.name}
              </h2>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {restaurant.category}
              </p>
            </div>
            {/* Score badge */}
            <div className="shrink-0 flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center"
                title="Attractiveness score based on patron looks (via looksmapping)"
              >
                <span className="text-white font-black text-lg">
                  {restaurant.attractiveScore.toFixed(1)}
                </span>
              </div>
              <span className="text-[8px] text-gray-300 mt-0.5">looks</span>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + " " + restaurant.neighborhood + " San Francisco")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{"\uD83D\uDCCD"}</span>
              <span className="underline">{restaurant.neighborhood}</span>
            </a>
            <span className="mx-1">{"\u00B7"}</span>
            <span>{restaurant.faces} reviews</span>
          </div>

          {/* Google rating stars */}
          {rating !== null && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const fill = Math.min(1, Math.max(0, rating - (star - 1)));
                  return (
                    <div key={star} className="relative w-4 h-4">
                      <span className="absolute inset-0 text-gray-200 text-sm leading-none">{"\u2605"}</span>
                      <span
                        className="absolute inset-0 text-amber-400 text-sm leading-none overflow-hidden"
                        style={{ width: `${fill * 100}%` }}
                      >{"\u2605"}</span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[11px] font-semibold text-gray-600">{rating.toFixed(1)}</span>
              {ratingCount !== null && (
                <span className="text-[10px] text-gray-400">({ratingCount.toLocaleString()})</span>
              )}
            </div>
          )}

          {/* Score bar — patron attractiveness via looksmapping */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-400 transition-all duration-500"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {restaurant.attractiveScore >= 8
                ? "Very Hot"
                : restaurant.attractiveScore >= 6
                  ? "Hot"
                  : "Warm"}
            </span>
          </div>
          <p className="text-[9px] text-gray-300 mt-0.5">
            Patron attractiveness score via <a href="https://walzr.com/looksmapping" target="_blank" rel="noopener noreferrer" className="underline">looksmapping</a>
          </p>

          {restaurant.faces < 10 && (
            <p className="text-amber-500 text-[10px] mt-1.5 font-medium">
              {"\u26A0\uFE0F"} Limited data
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default SwipeCard;
