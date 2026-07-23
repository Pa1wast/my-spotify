import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/lib/utils";

const LOGO_ASSETS = {
  icon: {
    src: "/logo/logo-icon.png",
    width: 160,
    height: 160,
    alt: "My Spotify",
  },
  full: {
    src: "/logo/logo-full.png",
    width: 445,
    height: 160,
    alt: "My Spotify",
  },
} as const;

export type AppLogoVariant = keyof typeof LOGO_ASSETS;

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

const ICON_SIZE_CLASSES = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
} as const;

const FULL_SIZE_CLASSES = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto",
  lg: "h-10 w-auto",
} as const;

export function AppLogo({
  variant = "full",
  className,
  href = "/dashboard",
  size = "md",
  priority = false,
}: AppLogoProps) {
  const asset = LOGO_ASSETS[variant];
  const sizeClass =
    variant === "icon" ? ICON_SIZE_CLASSES[size] : FULL_SIZE_CLASSES[size];

  const image = (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn(sizeClass, className)}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex shrink-0">
      {image}
    </Link>
  );
}
