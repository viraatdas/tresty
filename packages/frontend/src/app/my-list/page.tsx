"use client";

import { useState, useEffect, useCallback } from "react";
import type { SwipeRecord } from "@/lib/types";
import { getSwipeRecords, removeSwipeRecord } from "@/lib/storage";

type Tab = "want_to_go" | "been_there";

export default function MyListPage() {
  const [tab, setTab] = useState<Tab>("want_to_go");
  const [records, setRecords] = useState<SwipeRecord[]>([]);

  const loadRecords = useCallback(() => {
    setRecords(getSwipeRecords(tab));
  }, [tab]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleRemove = (restaurantId: string) => {
    removeSwipeRecord(restaurantId);
    loadRecords();
  };

  const count = records.length;

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      <header className="px-4 pt-3 pb-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-50">
        <h1 className="text-lg font-bold text-center mb-2.5">
          {"\u2B50"} Saved
        </h1>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => setTab("want_to_go")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === "want_to_go"
                ? "bg-white text-rose-500 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block mr-1"><path d="M5 3V21" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" /><path d="M5 3H17L13 8L17 13H5" fill="#22c55e" /></svg>Want to Go
          </button>
          <button
            onClick={() => setTab("been_there")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === "been_there"
                ? "bg-white text-blue-500 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {"\u2764\uFE0F"} Been There
          </button>
        </div>
      </header>

      {count > 0 && (
        <div className="px-4 pt-2">
          <p className="text-[11px] text-gray-300 font-medium">
            {count} restaurant{count !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <div className="text-5xl mb-4 animate-pop-in">
            {tab === "want_to_go" ? "\u2705" : "\u2764\uFE0F"}
          </div>
          <h3 className="text-gray-800 font-semibold mb-1">
            {tab === "want_to_go" ? "No spots saved yet" : "No visits logged"}
          </h3>
          <p className="text-gray-400 text-sm">
            {tab === "want_to_go"
              ? "Swipe right on restaurants you want to try!"
              : "Swipe up on restaurants you've already been to."}
          </p>
        </div>
      ) : (
        <div className="px-3 pb-4 space-y-1.5 mt-2">
          {records
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((record) => (
              <div
                key={record.restaurantId}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {record.restaurantName}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {record.category} {"\u00B7"} {record.neighborhood}
                  </p>
                  <p className="text-gray-300 text-[10px] mt-0.5">
                    {new Date(record.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(record.restaurantId)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 active:scale-90"
                  aria-label="Remove"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
