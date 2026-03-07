import { BASE_URL, findFlavorBySlug, findTierById, isThemeId, type ThemeId } from "./site-content";

export interface ShareState {
  tier?: string;
  flavor?: string;
  theme?: ThemeId;
  receipt?: string;
}

const RECEIPT_CODE_REGEX = /^CANDY-\d{8}-[A-Z0-9]{6}$/;

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

export function applyStateFromUrl(searchParams: URLSearchParams): ShareState {
  const tierCandidate = searchParams.get("tier");
  const flavorCandidate = searchParams.get("flavor");
  const themeCandidate = searchParams.get("theme");

  const tier = findTierById(tierCandidate)?.id;
  const flavor = findFlavorBySlug(flavorCandidate)?.slug;
  const theme = isThemeId(themeCandidate) ? themeCandidate : undefined;
  const receipt = normalizeReceiptCode(searchParams.get("receipt"));

  return {
    tier,
    flavor,
    theme,
    receipt
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

  const serialized = params.toString();
  url.search = serialized;

  return url.toString();
}
