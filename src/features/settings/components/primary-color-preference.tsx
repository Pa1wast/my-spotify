"use client";

import { useEffect, useState } from "react";

import { AccentColorPicker } from "@/features/settings/components/accent-color-picker";
import { useTheme } from "@/providers/theme-provider";
import { settingsActionLinkClass } from "@/shared/constants/settings-links";
import { DEFAULT_PRIMARY_COLOR } from "@/shared/lib/primary-color";
import { cn } from "@/shared/lib/utils";

export function PrimaryColorPreference() {
  const { primaryColor, setPrimaryColor, resetPrimaryColor } = useTheme();
  const [value, setValue] = useState(primaryColor);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(primaryColor);
  }, [primaryColor]);

  function markSaved() {
    setError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function handleApply() {
    const ok = setPrimaryColor(value);

    if (!ok) {
      setSaved(false);
      setError("Use rgba(r, g, b, a), rgb(r, g, b), or #RRGGBB.");
      return;
    }

    markSaved();
  }

  function handlePickerChange(next: string) {
    setValue(next);
    setPrimaryColor(next);
    setError(null);
    setSaved(false);
  }

  function handleReset() {
    resetPrimaryColor();
    setValue(DEFAULT_PRIMARY_COLOR);
    markSaved();
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="primary-color" className="block text-sm text-foreground">
          Primary color (RGBA)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="primary-color"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
              setSaved(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApply();
              }
            }}
            placeholder="rgba(166, 28, 60, 1)"
            className={cn(
              "min-w-0 flex-1 border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-foreground outline-none",
              "placeholder:text-muted-foreground focus:border-primary",
            )}
            autoComplete="off"
            spellCheck={false}
          />
          <AccentColorPicker color={value} onChange={handlePickerChange} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={handleApply} className={settingsActionLinkClass}>
          Apply color
        </button>
        <button type="button" onClick={handleReset} className={settingsActionLinkClass}>
          Reset
        </button>
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {saved && !error ? (
        <p className="text-xs text-muted-foreground" role="status">
          Accent color updated.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        The app stays black and white. This color is used for accents like active
        nav, logo mark, and focus rings. Click the swatch to open the picker.
      </p>
    </div>
  );
}
