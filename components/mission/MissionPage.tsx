"use client";

import WorldShell from "./WorldShell";
import { tatico } from "./tatico/config";

/** A página única do site: a sala tática. */
export default function MissionPage() {
  return <WorldShell world={tatico} />;
}
