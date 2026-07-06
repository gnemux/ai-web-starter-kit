"use client";

import { useEffect, useState } from "react";

type RoutineCatTabsClientProps = {
  cats: Array<{ id: string; name: string }>;
  initialCatId: string;
};

export function RoutineCatTabsClient({
  cats,
  initialCatId
}: RoutineCatTabsClientProps) {
  const [selectedCatId, setSelectedCatId] = useState(initialCatId);

  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>("[data-routine-cat-panel]")
      .forEach((panel) => {
        const active = panel.dataset.routineCatPanel === selectedCatId;
        panel.hidden = !active;
        panel.style.display = active ? "" : "none";
      });

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("cat_id", selectedCatId);
    window.history.replaceState(null, "", nextUrl);
  }, [selectedCatId]);

  return (
    <div aria-label="选择猫咪" className="flex flex-wrap gap-2" role="tablist">
      {cats.map((cat) => {
        const active = cat.id === selectedCatId;

        return (
          <button
            aria-controls={`routine-panel-${cat.id}`}
            aria-selected={active}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-[#07847f] bg-[#07847f] text-white"
                : "border-[#d9e0ea] bg-white text-[#526177] hover:border-[#07847f]/50 hover:text-[#07847f]"
            }`}
            key={cat.id}
            onClick={() => setSelectedCatId(cat.id)}
            role="tab"
            type="button"
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
