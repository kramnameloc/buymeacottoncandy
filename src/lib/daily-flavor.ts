import { FLAVORS, type FlavorEntry } from "./site-content";

function hashString(input: string): number {
  let hash = 5381;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }

  return hash >>> 0;
}

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyFlavorByDateKey(dateKey: string): FlavorEntry {
  const index = hashString(dateKey) % FLAVORS.length;
  return FLAVORS[index];
}

export function getDailyFlavor(date = new Date()): FlavorEntry {
  return getDailyFlavorByDateKey(getDateKey(date));
}

export function formatDailyFlavorDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
