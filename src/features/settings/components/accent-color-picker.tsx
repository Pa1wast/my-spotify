"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  hsvToRgb,
  parseRgbaChannels,
  rgbaColorToString,
  rgbToHsv,
  type HsvColor,
  type RgbaColor,
} from "@/shared/lib/primary-color";
import { cn } from "@/shared/lib/utils";

interface AccentColorPickerProps {
  color: string;
  onChange: (rgba: string) => void;
  className?: string;
}

function colorFromValue(value: string): RgbaColor {
  return (
    parseRgbaChannels(value) ?? {
      r: 166,
      g: 28,
      b: 60,
      a: 1,
    }
  );
}

function hueBackground() {
  return "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)";
}

export function AccentColorPicker({
  color,
  onChange,
  className,
}: AccentColorPickerProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const rgba = colorFromValue(color);
  const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function emit(next: RgbaColor) {
    onChange(rgbaColorToString(next));
  }

  function updateFromHsv(nextHsv: HsvColor, alpha = rgba.a) {
    const rgb = hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v);
    emit({ ...rgb, a: alpha });
  }

  function bindDrag(
    event: ReactPointerEvent<HTMLElement>,
    onMove: (clientX: number, clientY: number, rect: DOMRect) => void,
  ) {
    event.preventDefault();
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.setPointerCapture(event.pointerId);
    onMove(event.clientX, event.clientY, rect);

    function handleMove(moveEvent: PointerEvent) {
      onMove(moveEvent.clientX, moveEvent.clientY, rect);
    }

    function handleUp(upEvent: PointerEvent) {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener("pointermove", handleMove);
      target.removeEventListener("pointerup", handleUp);
    }

    target.addEventListener("pointermove", handleMove);
    target.addEventListener("pointerup", handleUp);
  }

  const hueColor = hsvToRgb(hsv.h, 1, 1);
  const hueCss = `rgb(${hueColor.r}, ${hueColor.g}, ${hueColor.b})`;

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-label="Open color picker"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="size-[18px] shrink-0 rounded-full border border-border shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ backgroundColor: color }}
      />

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Accent color picker"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-lg border border-border bg-card p-3 shadow-lg"
        >
          <div
            className="relative h-32 w-full cursor-crosshair touch-none rounded-md"
            style={{
              backgroundColor: hueCss,
              backgroundImage:
                "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
            }}
            onPointerDown={(event) =>
              bindDrag(event, (clientX, clientY, rect) => {
                const s = Math.min(
                  1,
                  Math.max(0, (clientX - rect.left) / rect.width),
                );
                const v = Math.min(
                  1,
                  Math.max(0, 1 - (clientY - rect.top) / rect.height),
                );
                updateFromHsv({ ...hsv, s, v });
              })
            }
          >
            <span
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>

          <div className="mt-3 space-y-3">
            <div
              className="relative h-3 w-full cursor-pointer touch-none rounded-full"
              style={{ background: hueBackground() }}
              onPointerDown={(event) =>
                bindDrag(event, (clientX, _clientY, rect) => {
                  const h =
                    Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) *
                    360;
                  updateFromHsv({ ...hsv, h });
                })
              }
            >
              <span
                className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  backgroundColor: hueCss,
                }}
              />
            </div>

            <div
              className="relative h-3 w-full cursor-pointer touch-none rounded-full border border-border"
              style={{
                backgroundImage: `
                  linear-gradient(to right, transparent, ${rgbaColorToString({ ...rgba, a: 1 })}),
                  linear-gradient(45deg, #555 25%, transparent 25%),
                  linear-gradient(-45deg, #555 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #555 75%),
                  linear-gradient(-45deg, transparent 75%, #555 75%)
                `,
                backgroundSize: "100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px",
                backgroundPosition: "0 0, 0 0, 0 4px, 4px -4px, -4px 0",
                backgroundColor: "#222",
              }}
              onPointerDown={(event) =>
                bindDrag(event, (clientX, _clientY, rect) => {
                  const a = Math.min(
                    1,
                    Math.max(0, (clientX - rect.left) / rect.width),
                  );
                  emit({ ...rgba, a });
                })
              }
            >
              <span
                className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{
                  left: `${rgba.a * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
