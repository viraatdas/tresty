"use client";

interface SwipeOverlayProps {
  direction: "left" | "right" | "up" | null;
  opacity: number;
}

function GreenFlagInline() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
      <path d="M5 3V21" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 3H17L13 8L17 13H5" fill="#22c55e" />
    </svg>
  );
}

export default function SwipeOverlay({
  direction,
  opacity,
}: SwipeOverlayProps) {
  if (!direction || opacity <= 0) return null;

  const config = {
    left: {
      text: "NOPE",
      emoji: "\uD83D\uDC4E",
      useFlag: false,
      bg: "bg-red-500/10",
      border: "border-red-500",
      textColor: "text-red-500",
      position: "right-6 top-12",
      rotate: "rotate-[12deg]",
    },
    right: {
      text: "WANT!",
      emoji: "",
      useFlag: true,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500",
      textColor: "text-emerald-500",
      position: "left-6 top-12",
      rotate: "rotate-[-12deg]",
    },
    up: {
      text: "BEEN",
      emoji: "\u2764\uFE0F",
      useFlag: false,
      bg: "bg-pink-500/10",
      border: "border-pink-500",
      textColor: "text-pink-500",
      position: "left-1/2 -translate-x-1/2 bottom-24",
      rotate: "rotate-0",
    },
  };

  const c = config[direction];

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none"
      style={{ opacity: Math.min(opacity, 1) }}
    >
      <div className={`absolute ${c.position} ${c.rotate} animate-stamp-in`}>
        <div
          className={`${c.border} ${c.textColor} border-[3px] rounded-lg px-4 py-2 backdrop-blur-sm ${c.bg}`}
        >
          <div className="flex items-center gap-2">
            {c.useFlag ? <GreenFlagInline /> : <span className="text-2xl">{c.emoji}</span>}
            <span className="text-2xl font-black tracking-wider">{c.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
