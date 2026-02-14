import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "forksy - Swipe to discover the hottest restaurants in SF";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Fork icon */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M60 20V180" stroke="white" strokeWidth="18" strokeLinecap="round" />
          <path d="M100 20V180" stroke="white" strokeWidth="18" strokeLinecap="round" />
          <path d="M140 20V180" stroke="white" strokeWidth="18" strokeLinecap="round" />
          <path d="M30 180 Q30 250 100 250 Q170 250 170 180" stroke="white" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M100 250V360" stroke="white" strokeWidth="20" strokeLinecap="round" />
        </svg>

        {/* App name */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            marginTop: 16,
            letterSpacing: "-0.02em",
          }}
        >
          forksy
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "rgba(255, 255, 255, 0.85)",
            marginTop: 10,
            fontWeight: 500,
          }}
        >
          Swipe to discover the hottest restaurants in SF
        </div>
      </div>
    ),
    { ...size }
  );
}
