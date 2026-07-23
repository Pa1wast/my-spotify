"use client";

import { FontFamilyPicker } from "@/features/settings/components/font-family-picker";
import { useTheme } from "@/providers/theme-provider";
import { settingsActionLinkClass } from "@/shared/constants/settings-links";
import {
  FONT_ROLE_LABELS,
  type FontRole,
} from "@/shared/lib/font-preferences";

const FONT_ROLES: FontRole[] = ["body", "heading", "action"];

export function FontPreferencesPanel() {
  const { fonts, setFontRole, resetFonts } = useTheme();

  return (
    <div className="space-y-5">
      {FONT_ROLES.map((role) => (
        <FontFamilyPicker
          key={role}
          label={FONT_ROLE_LABELS[role]}
          value={fonts[role]}
          onChange={(family) => setFontRole(role, family)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={resetFonts} className={settingsActionLinkClass}>
          Reset fonts
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Fonts load from Google Fonts. Body is for reading text, headings for
        titles, and button labels for nav and actions.
      </p>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <p className="font-sans text-muted-foreground">
          Body preview — the quick brown fox jumps over the lazy dog.
        </p>
        <p className="font-display text-2xl text-foreground">
          Heading preview — My Spotify
        </p>
        <p className="font-action text-base text-foreground">
          Button preview — Sync listening history
        </p>
      </div>
    </div>
  );
}
