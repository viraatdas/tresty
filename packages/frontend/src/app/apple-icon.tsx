import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #f43f5e, #f97316)",
        }}
      >
        <svg
          width="120"
          height="120"
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
      </div>
    ),
    { ...size }
  );
}
