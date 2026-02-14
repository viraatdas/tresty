"use client";

interface SwipeActionsProps {
  onSwipe: (direction: "left" | "right" | "up") => void;
  disabled?: boolean;
}

function GreenFlag({ size = 24, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M5 3H17L13 8L17 13H5" fill={color} />
    </svg>
  );
}

export { GreenFlag };

export default function SwipeActions({ onSwipe, disabled }: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-5 py-3 px-6">
      {/* Not interested — left arrow */}
      <button
        onClick={() => onSwipe("left")}
        disabled={disabled}
        className="group w-[60px] h-[60px] rounded-full bg-white border-2 border-red-400 flex items-center justify-center transition-all active:scale-90 hover:shadow-lg hover:shadow-red-100 disabled:opacity-30"
        aria-label="Not interested (left arrow)"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">{"\uD83D\uDC4E"}</span>
      </button>

      {/* Been there — up arrow */}
      <button
        onClick={() => onSwipe("up")}
        disabled={disabled}
        className="group w-[50px] h-[50px] rounded-full bg-white border-2 border-pink-400 flex items-center justify-center transition-all active:scale-90 hover:shadow-lg hover:shadow-pink-100 disabled:opacity-30"
        aria-label="Been there (up arrow)"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">{"\u2764\uFE0F"}</span>
      </button>

      {/* Want to go — right arrow */}
      <button
        onClick={() => onSwipe("right")}
        disabled={disabled}
        className="group w-[60px] h-[60px] rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center transition-all active:scale-90 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-30"
        aria-label="Want to go (right arrow)"
      >
        <span className="group-hover:scale-110 transition-transform">
          <GreenFlag size={28} color="white" />
        </span>
      </button>
    </div>
  );
}
