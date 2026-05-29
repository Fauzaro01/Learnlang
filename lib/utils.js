import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizePublicImageUrl(imagePath) {
  if (typeof imagePath !== "string") return "";

  const trimmed = imagePath.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
    return trimmed;
  }

  const publicPathMatch = trimmed.match(/(?:^|[\\/])public[\\/](.+)$/i);
  const normalizedPath = (publicPathMatch ? publicPathMatch[1] : trimmed)
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}
