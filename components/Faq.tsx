"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { FaqItem } from "@/lib/types";

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`faq-${index}`}
                onClick={() => setOpen(expanded ? -1 : index)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-xl"
              >
                {item.q}
                {expanded ? (
                  <Minus className="size-5 shrink-0" aria-hidden />
                ) : (
                  <Plus className="size-5 shrink-0" aria-hidden />
                )}
              </button>
            </h3>
            <p id={`faq-${index}`} hidden={!expanded} className="max-w-[70ch] pb-6 leading-[1.65] text-body">
              {item.a}
            </p>
          </div>
        );
      })}
    </div>
  );
}
