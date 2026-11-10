"use client";

import { useContent } from "@/lib/preferences";

export default function SkipLink() {
  const { ui } = useContent();
  return (
    <a
      href="#conteudo"
      className="fixed -top-24 left-4 z-50 rounded-b-md bg-accent px-4 py-3 text-sm font-semibold text-on-accent focus:top-0"
    >
      {ui.skip}
    </a>
  );
}
