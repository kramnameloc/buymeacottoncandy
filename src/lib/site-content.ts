export type ThemeId = "sky" | "sunset" | "carnival";

export interface Tier {
  id: string;
  title: string;
  priceLabel: string;
  joke: string;
  ctaLabel: string;
}

export interface Testimonial {
  name: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FlavorEntry {
  slug: string;
  message: string;
}

export interface ThemePreset {
  id: ThemeId;
  label: string;
  description: string;
}

export const BASE_URL = "https://buymeacottoncandy.com";
export const SITE_NAME = "Buy Me a Cotton Candy";
export const SITE_DESCRIPTION =
  "A playful, satirical cotton candy support page. No real payments, just sugar-spun fun.";

export const DEFAULT_TAGLINE = "Parody project. All in good fun.";
export const STORAGE_THEME_KEY = "bmacc-theme";
export const STORAGE_TAGLINE_KEY = "bmacc-tagline";
export const DEFAULT_THEME: ThemeId = "sky";

export const TIERS: Tier[] = [
  {
    id: "mini-puff",
    title: "Mini Puff",
    priceLabel: "$3",
    joke: "A polite cotton cloud for morally supporting absurd internet projects.",
    ctaLabel: "Spin a mini puff"
  },
  {
    id: "blue-whirl",
    title: "Blue Whirl",
    priceLabel: "$7",
    joke: "The signature tier. Slightly dramatic. Fully imaginary sugar impact.",
    ctaLabel: "Launch the blue whirl"
  },
  {
    id: "galaxy-fluff",
    title: "Galaxy Fluff",
    priceLabel: "$12",
    joke: "Premium support for elite nonsense and high-altitude cotton candy dreams.",
    ctaLabel: "Deploy galaxy fluff"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Casey from Cloud Nine",
    text: "I clicked once and immediately felt 14% more whimsical."
  },
  {
    name: "Jordan, Snack Economist",
    text: "Best fake purchase flow on the internet. Zero fraud, all sparkle."
  },
  {
    name: "Taylor, Dessert Engineer",
    text: "The user interface is smoother than spun sugar in a breeze."
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is this a real payment website?",
    a: "No. This is a satire project with a fake checkout celebration and no real transactions."
  },
  {
    q: "Will my card be charged?",
    a: "No cards, no wallets, no charges. Only harmless pretend receipts."
  },
  {
    q: "Can I clone this for my own joke project?",
    a: "Yes. Fork it, remix it, and keep the parody tone friendly and clearly labeled."
  }
];

export const FLAVORS: FlavorEntry[] = [
  {
    slug: "blue-raspberry-breeze",
    message: "Blue Raspberry Breeze approved your support request."
  },
  {
    slug: "cotton-candy-comet",
    message: "Cotton Candy Comet says your generosity is fluffing the timeline."
  },
  {
    slug: "sea-salt-sky",
    message: "Sea-Salt Sky flavor unlocked one bonus internet idea."
  },
  {
    slug: "premium-altitude",
    message: "Your sugar cloud has been promoted to premium altitude."
  },
  {
    slug: "swirl-conditions",
    message: "Cloud Machine reports perfect swirl conditions for your contribution."
  },
  {
    slug: "elite-pretend-purchase",
    message: "Flavor analysts confirm this was an elite pretend purchase."
  }
];

export const THEMES: ThemePreset[] = [
  {
    id: "sky",
    label: "Sky",
    description: "Classic light blue candy-cloud palette."
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm pink-orange carnival dusk mode."
  },
  {
    id: "carnival",
    label: "Carnival",
    description: "Bright fairground energy with bold contrasts."
  }
];

export function findTierById(tierId: string | null | undefined): Tier | undefined {
  if (!tierId) {
    return undefined;
  }

  return TIERS.find((tier) => tier.id === tierId);
}

export function findFlavorBySlug(flavorSlug: string | null | undefined): FlavorEntry | undefined {
  if (!flavorSlug) {
    return undefined;
  }

  return FLAVORS.find((flavor) => flavor.slug === flavorSlug);
}

export function isThemeId(value: string | null | undefined): value is ThemeId {
  if (!value) {
    return false;
  }

  return THEMES.some((theme) => theme.id === value);
}
