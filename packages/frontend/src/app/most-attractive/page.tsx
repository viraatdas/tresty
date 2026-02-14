"use client";

import { useState, useEffect } from "react";
import type { Restaurant } from "@/lib/types";
import {
  getTopRestaurants,
  getCategories,
  getNeighborhoods,
  getPhotoUrl,
} from "@/lib/api";
import { addSwipeRecord, hasBeenSwiped } from "@/lib/storage";

export default function MostAttractivePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCategories(), getNeighborhoods()]).then(([cats, hoods]) => {
      setCategories(cats.values);
      setNeighborhoods(hoods.values);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getTopRestaurants({
      limit: 50,
      minFaces: 10,
      category: selectedCategory || undefined,
      neighborhood: selectedNeighborhood || undefined,
    })
      .then((res) => setRestaurants(res.restaurants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedNeighborhood]);

  const handleAction = (
    restaurant: Restaurant,
    action: "want_to_go" | "been_there"
  ) => {
    addSwipeRecord(
      restaurant.id,
      restaurant.name,
      restaurant.category,
      restaurant.neighborhood,
      action
    );
    setActionMenu(null);
    setToastMsg(action === "want_to_go" ? "Added to Want to Go!" : "Marked as Been There!");
    setTimeout(() => setToastMsg(null), 2000);
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "\uD83E\uDD47";
    if (rank === 2) return "\uD83E\uDD48";
    if (rank === 3) return "\uD83E\uDD49";
    return `#${rank}`;
  };

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      <header className="px-4 pt-3 pb-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-50">
        <h1 className="text-lg font-bold text-center mb-1">
          {"\uD83D\uDD25"} Trending
        </h1>
        <p className="text-[10px] text-gray-300 text-center mb-2">
          Ranked by patron attractiveness via{" "}
          <a href="https://walzr.com/looksmapping" target="_blank" rel="noopener noreferrer" className="underline">looksmapping</a>
        </p>
        <div className="flex gap-2 mb-1.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 bg-gray-50 text-xs text-gray-700 rounded-xl px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="flex-1 bg-gray-50 text-xs text-gray-700 rounded-xl px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All Neighborhoods</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-pop-in">
          {toastMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-3 pb-4 space-y-2 mt-2">
          {restaurants.map((restaurant, index) => {
            const swiped = hasBeenSwiped(restaurant.id);
            const rank = index + 1;
            return (
              <div
                key={restaurant.id}
                className="relative flex gap-3 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
                onClick={() =>
                  setActionMenu(
                    actionMenu === restaurant.id ? null : restaurant.id
                  )
                }
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10 shrink-0">
                  <span className={`font-bold ${rank <= 3 ? "text-lg" : "text-sm text-gray-400"}`}>
                    {getMedalEmoji(rank)}
                  </span>
                </div>

                {/* Photo */}
                <div className="w-16 h-16 my-2 rounded-xl shrink-0 bg-gray-100 overflow-hidden">
                  <img
                    src={getPhotoUrl(restaurant.id)}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 py-2 pr-3 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {restaurant.category}
                  </p>
                  <p className="text-gray-300 text-[11px] truncate">
                    {restaurant.neighborhood}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-400"
                          style={{
                            width: `${(restaurant.attractiveScore / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-rose-500" title="Patron attractiveness via looksmapping">
                        {restaurant.attractiveScore.toFixed(1)}
                      </span>
                    </div>
                    {swiped && (
                      <span className="text-emerald-500 text-[10px] font-medium">
                        {"\u2713"} Saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Action menu */}
                {actionMenu === restaurant.id && (
                  <div className="absolute right-2 top-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden animate-pop-in">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(restaurant, "want_to_go");
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left hover:bg-gray-50 text-emerald-600 font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 3V21" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" /><path d="M5 3H17L13 8L17 13H5" fill="#22c55e" /></svg> Want to Go
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(restaurant, "been_there");
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left hover:bg-gray-50 text-pink-600 font-medium"
                    >
                      <span>{"\u2764\uFE0F"}</span> Been There
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
