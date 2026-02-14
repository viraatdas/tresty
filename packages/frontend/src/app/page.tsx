import SwipeDeck from "@/components/swipe/SwipeDeck";

export default function SwipePage() {
  return (
    <>
      <header className="px-4 pt-3 pb-1 flex items-center justify-center">
        <h1 className="text-xl font-black tracking-tight">
          <span className="text-rose-500">forksy</span>
          <span className="text-gray-300 text-xs font-medium ml-1.5">SF</span>
        </h1>
      </header>
      <SwipeDeck />
    </>
  );
}
