"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/*
 * Street-address suggestions from Google Places API (New) Autocomplete.
 *
 * - Calls https://places.googleapis.com/v1/places:autocomplete from the browser with the
 *   referrer-restricted key in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. No Maps JavaScript API is loaded.
 * - Without a key, or if Google refuses the request, it is a plain text input, so the form never breaks.
 * - Requests are debounced and start at 4 characters, to stay inside the free monthly Autocomplete Requests.
 * - Results are limited to street addresses in the Phoenix Valley (Maricopa County and the Queen Creek / Pinal edge).
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";
const MIN_CHARS = 4;
const DEBOUNCE_MS = 300;

// Rectangle around Maricopa County, wide enough to include the Pinal County side of Queen Creek.
const SERVICE_AREA = {
  rectangle: {
    low: { latitude: 32.4, longitude: -113.4 },
    high: { latitude: 34.1, longitude: -110.9 },
  },
};

type Suggestion = { id: string; main: string; secondary: string; full: string };

type Tone = "hero" | "theme";

const tones: Record<Tone, { list: string; option: string; active: string; muted: string; footer: string }> = {
  // The hero input is always white, so its list is always light, whatever the site theme.
  hero: {
    list: "border-[#e2e7ee] bg-white text-[#142033] [color-scheme:light]",
    option: "text-[#142033]",
    active: "bg-[#e7edf3]",
    muted: "text-[#5c6b7c]",
    footer: "border-[#e2e7ee] text-[#5c6b7c]",
  },
  // Form inputs follow the site theme tokens, so the list does too.
  theme: {
    list: "border-line bg-panel text-ink",
    option: "text-ink",
    active: "bg-mist",
    muted: "text-muted",
    footer: "border-line text-muted",
  },
};

let warned = false;

export function AddressAutocomplete({
  id,
  name,
  value,
  onChange,
  onSelect,
  language = "en",
  tone = "theme",
  placeholder,
  required,
  className,
  ariaInvalid,
  ariaDescribedBy,
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  language?: "en" | "es";
  tone?: Tone;
  placeholder?: string;
  required?: boolean;
  className: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const typed = useRef(false);
  const session = useRef<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const colors = tones[tone];

  useEffect(() => {
    if (!API_KEY || !typed.current) return;
    const input = value.trim();
    if (input.length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      session.current ??= newToken();
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask":
              "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat",
          },
          body: JSON.stringify({
            input,
            languageCode: language,
            includedRegionCodes: ["us"],
            includedPrimaryTypes: ["street_address", "premise", "subpremise"],
            locationRestriction: SERVICE_AREA,
            sessionToken: session.current,
          }),
        });
        if (!response.ok) {
          if (!warned) {
            warned = true;
            console.warn("[address-autocomplete] Google Places returned", response.status);
          }
          setSuggestions([]);
          setOpen(false);
          return;
        }
        const data = (await response.json()) as PlacesResponse;
        const next = toSuggestions(data);
        setSuggestions(next);
        setActive(-1);
        setOpen(next.length > 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSuggestions([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value, language]);

  useEffect(() => () => abort.current?.abort(), []);

  function choose(item: Suggestion) {
    typed.current = false;
    session.current = null;
    abort.current?.abort();
    setOpen(false);
    setSuggestions([]);
    setActive(-1);
    onChange(item.full);
    onSelect?.(item.full);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(suggestions[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const expanded = open && suggestions.length > 0;

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="street-address"
        role={API_KEY ? "combobox" : undefined}
        aria-autocomplete={API_KEY ? "list" : undefined}
        aria-expanded={API_KEY ? expanded : undefined}
        aria-controls={API_KEY ? listId : undefined}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onChange={(event) => {
          typed.current = true;
          onChange(event.target.value);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        className={className}
      />
      {expanded ? (
        <div className={`absolute left-0 right-0 top-full z-40 mt-1 border shadow-lg ${colors.list}`}>
          <ul id={listId} role="listbox" aria-label={language === "es" ? "Direcciones sugeridas" : "Suggested addresses"}>
            {suggestions.map((item, index) => (
              <li
                key={item.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
                className={`cursor-pointer px-4 py-3 text-left text-base leading-6 ${colors.option} ${
                  index === active ? colors.active : ""
                }`}
              >
                <span className="block font-semibold">{item.main}</span>
                {item.secondary ? <span className={`block text-sm ${colors.muted}`}>{item.secondary}</span> : null}
              </li>
            ))}
          </ul>
          <p className={`border-t px-4 py-2 text-right text-xs ${colors.footer}`}>Powered by Google</p>
        </div>
      ) : null}
    </div>
  );
}

type PlacesResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
    };
  }>;
};

function toSuggestions(data: PlacesResponse): Suggestion[] {
  const items: Suggestion[] = [];
  for (const entry of data.suggestions ?? []) {
    const prediction = entry.placePrediction;
    const full = cleanAddress(prediction?.text?.text ?? "");
    if (!prediction?.placeId || !full) continue;
    items.push({
      id: prediction.placeId,
      full,
      main: prediction.structuredFormat?.mainText?.text ?? full,
      secondary: cleanAddress(prediction.structuredFormat?.secondaryText?.text ?? ""),
    });
  }
  return items.slice(0, 5);
}

function cleanAddress(text: string) {
  return text.replace(/,\s*(USA|EE\. UU\.|Estados Unidos)$/i, "").trim();
}

function newToken() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
