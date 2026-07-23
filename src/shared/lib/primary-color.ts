import type { CSSProperties } from "react";

export const DEFAULT_PRIMARY_COLOR = "rgba(166, 28, 60, 1)";
export const PRIMARY_COLOR_COOKIE_NAME = "my-spotify-primary-color";

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

const RGBA_PATTERN =
  /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i;
const RGB_PATTERN =
  /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
const HEX_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function toRgbaString(r: number, g: number, b: number, a: number) {
  const alpha = clamp01(a);
  const formattedAlpha = Number.isInteger(alpha)
    ? String(alpha)
    : alpha.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

  return `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${formattedAlpha})`;
}

export function rgbaColorToString(color: RgbaColor) {
  return toRgbaString(color.r, color.g, color.b, color.a);
}

export function parseRgbaChannels(value: string): RgbaColor | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const rgbaMatch = trimmed.match(RGBA_PATTERN);
  if (rgbaMatch) {
    return {
      r: clampChannel(Number(rgbaMatch[1])),
      g: clampChannel(Number(rgbaMatch[2])),
      b: clampChannel(Number(rgbaMatch[3])),
      a: clamp01(Number(rgbaMatch[4])),
    };
  }

  const rgbMatch = trimmed.match(RGB_PATTERN);
  if (rgbMatch) {
    return {
      r: clampChannel(Number(rgbMatch[1])),
      g: clampChannel(Number(rgbMatch[2])),
      b: clampChannel(Number(rgbMatch[3])),
      a: 1,
    };
  }

  const hexMatch = trimmed.match(HEX_PATTERN);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  return null;
}

/** Normalize user input into a valid rgba() string, or null if invalid. */
export function parsePrimaryColorInput(value: string): string | null {
  const channels = parseRgbaChannels(value);
  return channels ? rgbaColorToString(channels) : null;
}

export function rgbaToHex({ r, g, b }: RgbaColor) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}

export function hsvToRgb(h: number, s: number, v: number): Omit<RgbaColor, "a"> {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: clampChannel((rp + m) * 255),
    g: clampChannel((gp + m) * 255),
    b: clampChannel((bp + m) * 255),
  };
}

export function isValidPrimaryColor(value: string) {
  return parsePrimaryColorInput(value) !== null;
}

export function applyPrimaryColorToDocument(color: string) {
  const root = document.documentElement.style;
  root.setProperty("--primary", color);
  root.setProperty("--accent", color);
  root.setProperty("--ring", color);
  root.setProperty("--sidebar-primary", color);
  root.setProperty("--sidebar-ring", color);
  root.setProperty("--chart-1", color);
}

export function primaryColorInlineStyle(color: string): CSSProperties {
  return {
    ["--primary" as string]: color,
    ["--accent" as string]: color,
    ["--ring" as string]: color,
    ["--sidebar-primary" as string]: color,
    ["--sidebar-ring" as string]: color,
    ["--chart-1" as string]: color,
  };
}
