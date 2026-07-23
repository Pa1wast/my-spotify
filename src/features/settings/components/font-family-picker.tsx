"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { searchGoogleFonts } from "@/shared/constants/google-fonts";
import { loadGoogleFont } from "@/shared/lib/font-preferences";
import { cn } from "@/shared/lib/utils";

interface FontFamilyPickerProps {
  label: string;
  value: string;
  onChange: (family: string) => void;
}

export function FontFamilyPicker({
  label,
  value,
  onChange,
}: FontFamilyPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    loadGoogleFont(value);
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, value]);

  const results = useMemo(() => searchGoogleFonts(query, 10), [query]);

  useEffect(() => {
    results.forEach((family) => loadGoogleFont(family));
  }, [results]);

  function selectFamily(family: string) {
    onChange(family);
    setQuery(family);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <label className="block text-sm text-foreground">{label}</label>
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search Google Fonts…"
        className={cn(
          "w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-foreground outline-none",
          "placeholder:text-muted-foreground focus:border-primary",
        )}
        style={{ fontFamily: `"${value}", ui-sans-serif, sans-serif` }}
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
      />

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 max-h-56 w-full overflow-y-auto border-b border-border bg-background"
        >
          {results.length === 0 ? (
            <li className="border-t border-border py-2 text-sm text-muted-foreground">
              No fonts found.
            </li>
          ) : (
            results.map((family) => {
              const selected = family === value;

              return (
                <li key={family} className="border-t border-border">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectFamily(family)}
                    className={cn(
                      "w-full py-2 text-left text-sm transition-colors",
                      selected
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    style={{
                      fontFamily: `"${family}", ui-sans-serif, sans-serif`,
                    }}
                  >
                    {family}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
