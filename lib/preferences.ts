"use client";

import { useSyncExternalStore } from "react";
import { content, siteConfig } from "./site-data";
import type { Content, Locale } from "./types";

// Preferências do visitante (idioma e movimento), lembradas no localStorage.
// O HTML estático sai sempre em PT com movimento ligado; o cliente aplica a escolha salva.

export type Preferences = { locale: Locale; motion: boolean };

const KEY = "pf:prefs";
const SERVER: Preferences = { locale: siteConfig.defaultLocale, motion: true };
const listeners = new Set<() => void>();
let state: Preferences | null = null;

function read(): Preferences {
  if (state) return state;
  let saved: Partial<Preferences> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {}
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  state = {
    locale: saved.locale === "en" ? "en" : "pt",
    motion: typeof saved.motion === "boolean" ? saved.motion : !reduced,
  };
  apply(state);
  return state;
}

function apply(prefs: Preferences) {
  const root = document.documentElement;
  root.lang = prefs.locale === "en" ? "en" : siteConfig.lang;
  root.dataset.motion = prefs.motion ? "on" : "off";
}

export function setPreferences(patch: Partial<Preferences>) {
  state = { ...read(), ...patch };
  apply(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, read, () => SERVER);
}

/** Conteúdo no idioma escolhido. */
export function useContent(): Content {
  return content[usePreferences().locale];
}
