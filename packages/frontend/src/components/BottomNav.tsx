"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Discover", icon: "&#x2764;&#xFE0F;", activeIcon: "&#x2764;&#xFE0F;" },
  { href: "/most-attractive", label: "Trending", icon: "&#x1F525;", activeIcon: "&#x1F525;" },
  { href: "/my-list", label: "Saved", icon: "&#x2B50;", activeIcon: "&#x2B50;" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around bg-white border-t border-gray-100 py-1.5 px-4 safe-area-pb">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0 px-6 py-1 rounded-2xl transition-all ${
              active
                ? "text-rose-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span
              className={`text-[22px] transition-transform ${active ? "scale-110" : ""}`}
              dangerouslySetInnerHTML={{ __html: active ? tab.activeIcon : tab.icon }}
            />
            <span className={`text-[10px] font-semibold ${active ? "text-rose-500" : "text-gray-400"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
