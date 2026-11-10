"use client";

import { useEffect, useState } from "react";
import { usePreferences } from "@/lib/preferences";

type TypedLinesProps = { lines: string[]; speed?: number; hold?: number };

/** Digita e apaga cada linha em sequência. Com movimento desligado, mostra a primeira linha parada. */
export default function TypedLines({ lines, speed = 58, hold = 1900 }: TypedLinesProps) {
  const { motion } = usePreferences();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = lines[i % lines.length] ?? "";

  useEffect(() => {
    if (!motion) return;
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && n < word.length) t = setTimeout(() => setN(n + 1), speed);
    else if (!deleting) t = setTimeout(() => setDeleting(true), hold);
    else if (n > 0) t = setTimeout(() => setN(n - 1), speed / 2);
    else
      t = setTimeout(() => {
        setDeleting(false);
        setI(i + 1);
      }, speed);
    return () => clearTimeout(t);
  }, [motion, n, deleting, i, word, speed, hold]);

  const shown = motion ? word.slice(0, n) : lines[0];
  const cut = shown.lastIndexOf(" ");
  return (
    <>
      <span className="sr-only">{lines.join(", ")}</span>
      <span aria-hidden>
        {cut > -1 && shown.slice(0, cut + 1)}
        <span className="whitespace-nowrap">
          {cut > -1 ? shown.slice(cut + 1) : shown}
          <span className="typed-caret" />
        </span>
      </span>
    </>
  );
}
