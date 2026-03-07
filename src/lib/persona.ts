import { FLAVORS } from "./site-content";

export interface FlavorPersona {
  seed: string;
  title: string;
  tagline: string;
  flavorBadge: string;
}

const ADJECTIVES = [
  "Whimsical",
  "Quantum",
  "Turbo",
  "Ceremonial",
  "Legendary",
  "Cloudborne",
  "Deluxe",
  "Sparkly"
];

const NOUNS = [
  "Sugar Strategist",
  "Flavor Architect",
  "Carousel Pilot",
  "Cloud Negotiator",
  "Snack Futurist",
  "Confetti Auditor",
  "Joke Treasurer",
  "Candy Diplomat"
];

const TAGLINES = [
  "Calibrated for harmless nonsense and perfect timing.",
  "Certified to spin internet joy at premium altitude.",
  "Running a strict no-boring-content policy since day one.",
  "Powered by dramatic pauses and blue raspberry confidence.",
  "Known for world-class pretend receipts and elite vibes.",
  "Negotiates peace between whimsy and absurdity."
];

function hashString(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function toSeedHex(hash: number): string {
  return hash.toString(16).padStart(8, "0");
}

function pickValue(values: string[], seed: number, salt: number): string {
  const index = Math.abs((seed + salt * 1013904223) % values.length);
  return values[index];
}

function parseSeed(seed: string): number {
  const normalized = seed.trim().toLowerCase();
  const asNumber = Number.parseInt(normalized, 16);

  if (!Number.isFinite(asNumber) || asNumber < 0) {
    throw new Error("Persona seed must be a positive hexadecimal string.");
  }

  return asNumber >>> 0;
}

export function normalizePersonaInput(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

export function personaFromSeed(seed: string): FlavorPersona {
  const seedNumber = parseSeed(seed);
  const adjective = pickValue(ADJECTIVES, seedNumber, 1);
  const noun = pickValue(NOUNS, seedNumber, 2);
  const tagline = pickValue(TAGLINES, seedNumber, 3);
  const flavor = FLAVORS[Math.abs((seedNumber + 7) % FLAVORS.length)];

  return {
    seed: toSeedHex(seedNumber),
    title: `${adjective} ${noun}`,
    tagline,
    flavorBadge: flavor.message
  };
}

export function personaFromInput(input: string): FlavorPersona | undefined {
  const normalized = normalizePersonaInput(input);
  if (!normalized) {
    return undefined;
  }

  const seed = toSeedHex(hashString(normalized));
  return personaFromSeed(seed);
}
