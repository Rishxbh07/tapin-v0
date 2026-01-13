import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This allows us to combine classes safely: cn("bg-red-500", isMobile && "p-4")
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}