import { BASE_URL, findFlavorBySlug, findTierById, isThemeId, type ThemeId } from "./site-content";

export interface ShareState {
  tier?: string;
  flavor?: string;
  theme?: ThemeId;
  receipt?: string;
  persona?: string;
}

const RECEIPT_CODE_REGEX = /^[A-Z0-9-]{5,40}$/;
const PERSONA_SEED_REGEX = /^[a-f0-9]{6,16}$/;

function normalizeReceiptCode(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  if (!RECEIPT_CODE_REGEX.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizePersonaSeed(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!PERSONA_SEED_REGEX.test(normalized)) {
    return undefined;
  }

  return normalized;
}

export function applyStateFromUrl(searchParams: URLSearchParams): ShareState {
  const tierCandidate = searchParams.get("tier");
  const flavorCandidate = searchParams.get("flavor");
  const themeCandidate = searchParams.get("theme");

  const tier = findTierById(tierCandidate)?.id;
  const flavor = findFlavorBySlug(flavorCandidate)?.slug;
  const theme = isThemeId(themeCandidate) ? themeCandidate : undefined;
  const receipt = normalizeReceiptCode(searchParams.get("receipt"));
  const persona = normalizePersonaSeed(searchParams.get("persona"));

  return {
    tier,
    flavor,
    theme,
    receipt,
    persona
  };
}

export function buildShareUrl(state: ShareState, baseUrl = BASE_URL): string {
  const url = new URL(baseUrl, BASE_URL);
  const params = new URLSearchParams();

  if (state.tier && findTierById(state.tier)) {
    params.set("tier", state.tier);
  }

  if (state.flavor && findFlavorBySlug(state.flavor)) {
    params.set("flavor", state.flavor);
  }

  if (state.theme && isThemeId(state.theme)) {
    params.set("theme", state.theme);
  }

  const receipt = normalizeReceiptCode(state.receipt ?? null);
  if (receipt) {
    params.set("receipt", receipt);
  }

  const persona = normalizePersonaSeed(state.persona ?? null);
  if (persona) {
    params.set("persona", persona);
  }

  const serialized = params.toString();
  url.search = serialized;

  return url.toString();
}
