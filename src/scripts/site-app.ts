import { formatDailyFlavorDate, getDailyFlavor } from "../lib/daily-flavor";
import { applyStateFromUrl, buildShareUrl, type ShareState } from "../lib/share-state";
import {
  DEFAULT_TAGLINE,
  DEFAULT_THEME,
  FLAVORS,
  STORAGE_TAGLINE_KEY,
  STORAGE_THEME_KEY,
  TIERS,
  findFlavorBySlug,
  findTierById,
  isThemeId,
  type FlavorEntry,
  type ThemeId,
  type Tier
} from "../lib/site-content";

interface TriggerOptions {
  immediateSuccess?: boolean;
  receiptCode?: string;
}

declare global {
  interface Window {
    triggerCottonCandyMoment: (tierId: string, options?: TriggerOptions) => void;
  }
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function requireElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }
  return element as T;
}

function requireChildElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element as T;
}

const heroCta = requireElementById<HTMLButtonElement>("hero-cta");
const tierGrid = requireElementById<HTMLDivElement>("tier-grid");
const flavorWall = requireElementById<HTMLParagraphElement>("flavor-wall");
const flavorRefresh = requireElementById<HTMLButtonElement>("flavor-refresh");
const toast = requireElementById<HTMLDivElement>("toast");
const confettiOverlay = requireElementById<HTMLDivElement>("confetti-overlay");
const shareSite = requireElementById<HTMLButtonElement>("share-site");
const copyShareLink = requireElementById<HTMLButtonElement>("copy-share-link");
const shareX = requireElementById<HTMLAnchorElement>("share-x");
const shareLinkedIn = requireElementById<HTMLAnchorElement>("share-linkedin");
const shareFacebook = requireElementById<HTMLAnchorElement>("share-facebook");
const themePicker = requireElementById<HTMLDivElement>("theme-picker");
const customTaglineInput = requireElementById<HTMLInputElement>("custom-tagline");
const saveTagline = requireElementById<HTMLButtonElement>("save-tagline");
const resetCustomization = requireElementById<HTMLButtonElement>("reset-customization");
const taglineDisplay = requireElementById<HTMLParagraphElement>("tagline-display");
const dailyFlavorDate = requireElementById<HTMLParagraphElement>("daily-flavor-date");
const dailyFlavorMessage = requireElementById<HTMLParagraphElement>("daily-flavor-message");

const celebrationModal = requireElementById<HTMLDivElement>("celebration-modal");
const modalPanel = requireChildElement<HTMLDivElement>(celebrationModal, ".modal-panel");
const modalClose = requireElementById<HTMLButtonElement>("modal-close");
const modalDone = requireElementById<HTMLButtonElement>("modal-done");
const receiptShare = requireElementById<HTMLButtonElement>("receipt-share");
const modalTitle = requireElementById<HTMLHeadingElement>("celebration-title");
const modalMessage = requireElementById<HTMLParagraphElement>("modal-message");
const receiptId = requireElementById<HTMLElement>("receipt-id");
const receiptDate = requireElementById<HTMLElement>("receipt-date");
const receiptStatus = requireElementById<HTMLElement>("receipt-status");
const receiptItem = requireElementById<HTMLElement>("receipt-item");
const receiptItemPrice = requireElementById<HTMLElement>("receipt-item-price");
const receiptFee = requireElementById<HTMLElement>("receipt-fee");
const receiptTax = requireElementById<HTMLElement>("receipt-tax");
const receiptTotal = requireElementById<HTMLElement>("receipt-total");
const receiptNote = requireElementById<HTMLElement>("receipt-note");
const confettiZone = requireElementById<HTMLDivElement>("confetti-zone");
const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

const state = {
  wallFlavorSlug: FLAVORS[0].slug,
  celebrationFlavorSlug: FLAVORS[0].slug,
  activeTierId: TIERS[0].id,
  activeTheme: DEFAULT_THEME,
  lastReceiptCode: undefined as string | undefined,
  isApplyingUrlState: false,
  processingTimer: null as number | null,
  confettiTimer: null as number | null,
  toastTimer: null as number | null
};

const THEME_COLORS: Record<ThemeId, string> = {
  sky: "#49abed",
  sunset: "#f2679f",
  carnival: "#39c46a"
};

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore blocked storage environments.
  }
}

function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore blocked storage environments.
  }
}

function currentPageBaseUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

function pickNextFlavor(previousSlug: string): FlavorEntry {
  if (FLAVORS.length <= 1) {
    return FLAVORS[0];
  }

  let candidate = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
  while (candidate.slug === previousSlug) {
    candidate = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
  }

  return candidate;
}

function getShareState(options: { includeReceipt?: boolean } = {}): ShareState {
  return {
    tier: state.activeTierId,
    flavor: state.wallFlavorSlug,
    theme: state.activeTheme,
    receipt: options.includeReceipt ? state.lastReceiptCode : undefined
  };
}

function buildCurrentShareUrl(options: { includeReceipt?: boolean } = {}): string {
  return buildShareUrl(getShareState(options), currentPageBaseUrl());
}

function syncUrl(options: { includeReceipt?: boolean } = {}): void {
  const url = new URL(buildCurrentShareUrl(options));
  const pathAndSearch = `${url.pathname}${url.search}`;
  window.history.replaceState({}, "", pathAndSearch);
}

function updateSocialLinks(url: string): void {
  const shareText = "Fund my top-tier nonsense with imaginary cotton candy.";
  shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  shareLinkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function updateShareTargets(): void {
  const url = buildCurrentShareUrl();
  updateSocialLinks(url);
  if (!state.isApplyingUrlState) {
    syncUrl();
  }
}

function showToast(message: string): void {
  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
  }

  toast.textContent = message;
  toast.classList.add("show");

  state.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

function setActiveTier(tierId: string): Tier {
  const tier = findTierById(tierId) ?? TIERS[0];
  state.activeTierId = tier.id;

  const cards = tierGrid.querySelectorAll<HTMLElement>("[data-tier-card]");
  cards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.tierCard === tier.id);
  });

  updateShareTargets();
  return tier;
}

function updateFlavorWall(flavor: FlavorEntry, manual = false): void {
  state.wallFlavorSlug = flavor.slug;
  flavorWall.textContent = `"${flavor.message}"`;
  updateShareTargets();

  if (manual) {
    showToast("Flavor wall shuffled.");
  }
}

function setFlavorBySlug(flavorSlug: string | undefined, manual = false): void {
  if (!flavorSlug) {
    return;
  }

  const flavor = findFlavorBySlug(flavorSlug) ?? FLAVORS[0];
  updateFlavorWall(flavor, manual);
}

function rotateFlavorWall(manual = false): void {
  const flavor = pickNextFlavor(state.wallFlavorSlug);
  updateFlavorWall(flavor, manual);
}

function applyTheme(theme: ThemeId, persist = true): void {
  state.activeTheme = theme;
  document.documentElement.dataset.theme = theme;
  if (themeColorMeta) {
    themeColorMeta.content = THEME_COLORS[theme];
  }

  const buttons = themePicker.querySelectorAll<HTMLButtonElement>("[data-theme-id]");
  buttons.forEach((button) => {
    const isCurrent = button.dataset.themeId === theme;
    button.setAttribute("aria-checked", isCurrent ? "true" : "false");
  });

  if (persist) {
    writeStorage(STORAGE_THEME_KEY, theme);
  }

  updateShareTargets();
}

function setTagline(value: string, persist = true): void {
  const normalized = value.trim();
  const tagline = normalized.length > 0 ? normalized : DEFAULT_TAGLINE;
  taglineDisplay.textContent = tagline;
  customTaglineInput.value = tagline === DEFAULT_TAGLINE ? "" : tagline;

  if (persist) {
    if (tagline === DEFAULT_TAGLINE) {
      removeStorage(STORAGE_TAGLINE_KEY);
    } else {
      writeStorage(STORAGE_TAGLINE_KEY, tagline);
    }
  }
}

function loadStoredCustomization(): void {
  const storedTheme = readStorage(STORAGE_THEME_KEY);
  if (isThemeId(storedTheme)) {
    applyTheme(storedTheme, false);
  } else {
    applyTheme(DEFAULT_THEME, false);
  }

  const storedTagline = readStorage(STORAGE_TAGLINE_KEY) ?? DEFAULT_TAGLINE;
  setTagline(storedTagline, false);
}

function buildReceiptCode(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const serial = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CANDY-${stamp}-${serial}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getReceiptBreakdown(tier: Tier) {
  const subtotal = Number.parseFloat(tier.priceLabel.replace(/[^0-9.]/g, "")) || 0;
  const serviceFee = subtotal >= 10 ? 0.99 : 0.69;
  const tax = Number(((subtotal + serviceFee) * 0.0825).toFixed(2));
  const total = Number((subtotal + serviceFee + tax).toFixed(2));
  return { subtotal, serviceFee, tax, total };
}

function renderReceipt(tier: Tier, options: { code: string; status: string; note: string }): void {
  const now = new Date();
  const { subtotal, serviceFee, tax, total } = getReceiptBreakdown(tier);

  receiptId.textContent = options.code;
  receiptDate.textContent = formatReceiptDate(now);
  receiptStatus.textContent = options.status;
  receiptItem.textContent = `${tier.title} cotton candy`;
  receiptItemPrice.textContent = formatCurrency(subtotal);
  receiptFee.textContent = formatCurrency(serviceFee);
  receiptTax.textContent = formatCurrency(tax);
  receiptTotal.textContent = formatCurrency(total);
  receiptNote.textContent = options.note;
}

function clearConfettiZone(): void {
  confettiZone.textContent = "";
}

function clearConfettiOverlay(): void {
  if (state.confettiTimer) {
    window.clearTimeout(state.confettiTimer);
    state.confettiTimer = null;
  }

  confettiOverlay.classList.remove("is-active");
  confettiOverlay.textContent = "";
}

function paintConfetti(): void {
  clearConfettiOverlay();
  clearConfettiZone();

  if (prefersReducedMotion.matches) {
    const staticNote = document.createElement("p");
    staticNote.className = "micro-disclaimer";
    staticNote.textContent = "Celebration animation skipped to respect your reduced-motion setting.";
    confettiZone.append(staticNote);
    return;
  }

  const colors = ["#49abed", "#82d3ff", "#1e74b6", "#fdcf74", "#ffffff"];
  confettiOverlay.classList.add("is-active");

  for (let i = 0; i < 140; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-(6 + Math.random() * 30)}vh`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.55 + Math.random() * 1.8}s`;
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.setProperty("--fall-distance", `${108 + Math.random() * 20}vh`);
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 24}vw`);
    confettiOverlay.append(piece);
  }

  state.confettiTimer = window.setTimeout(() => {
    clearConfettiOverlay();
  }, 3400);
}

function openModal(): void {
  celebrationModal.classList.add("is-open");
  celebrationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalPanel.focus();
}

function closeModal(): void {
  if (state.processingTimer) {
    window.clearTimeout(state.processingTimer);
    state.processingTimer = null;
  }

  celebrationModal.classList.remove("is-open");
  celebrationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  clearConfettiOverlay();
}

function showProcessing(tier: Tier): void {
  modalDone.hidden = true;
  receiptShare.hidden = true;
  modalTitle.textContent = "Spinning sugar machine...";
  modalMessage.textContent = `Whipping up a ${tier.title} cloud. Please enjoy this dramatic fake wait.`;

  renderReceipt(tier, {
    code: "Pending...",
    status: "Authorizing...",
    note: "Simulated checkout in progress. No real funds are moving."
  });

  clearConfettiZone();
}

function showSuccess(tier: Tier, options: { receiptCode?: string } = {}): void {
  const flavor = pickNextFlavor(state.celebrationFlavorSlug);
  state.celebrationFlavorSlug = flavor.slug;

  state.lastReceiptCode = options.receiptCode ?? buildReceiptCode();

  modalDone.hidden = false;
  receiptShare.hidden = false;
  modalTitle.textContent = "Cotton candy acquired";
  modalMessage.textContent = flavor.message;

  renderReceipt(tier, {
    code: state.lastReceiptCode,
    status: "Approved (simulated)",
    note: "Parody receipt only. Your actual charge is $0.00."
  });

  paintConfetti();
  showToast(`${tier.title} delivered. Zero dollars charged.`);
}

function triggerCottonCandyMoment(tierId: string, options: TriggerOptions = {}): void {
  const tier = setActiveTier(tierId);

  openModal();

  if (options.immediateSuccess) {
    showSuccess(tier, { receiptCode: options.receiptCode });
    return;
  }

  showProcessing(tier);

  const delay = 1100 + Math.floor(Math.random() * 700);
  if (state.processingTimer) {
    window.clearTimeout(state.processingTimer);
  }

  state.processingTimer = window.setTimeout(() => {
    showSuccess(tier);
  }, delay);
}

window.triggerCottonCandyMoment = triggerCottonCandyMoment;

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

async function shareLink(url: string, title: string, text: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      showToast("Share sheet opened.");
      return;
    } catch {
      // Ignore and fall back to clipboard.
    }
  }

  const copied = await copyText(url);
  showToast(copied ? "Share link copied." : "Copy failed. Use the social buttons below.");
}

function updateDailyFlavorSection(): void {
  const flavor = getDailyFlavor(new Date());
  dailyFlavorDate.textContent = formatDailyFlavorDate(new Date());
  dailyFlavorMessage.textContent = flavor.message;
  dailyFlavorMessage.dataset.flavorSlug = flavor.slug;
}

function applyUrlState(): void {
  const urlState = applyStateFromUrl(new URLSearchParams(window.location.search));
  state.isApplyingUrlState = true;

  if (urlState.theme) {
    applyTheme(urlState.theme, true);
  }

  if (urlState.tier) {
    setActiveTier(urlState.tier);
  } else {
    setActiveTier(TIERS[0].id);
  }

  if (urlState.flavor) {
    setFlavorBySlug(urlState.flavor);
  } else {
    setFlavorBySlug(flavorWall.dataset.defaultFlavor);
  }

  if (urlState.receipt) {
    triggerCottonCandyMoment(state.activeTierId, {
      immediateSuccess: true,
      receiptCode: urlState.receipt
    });
  }

  state.isApplyingUrlState = false;
  syncUrl({ includeReceipt: Boolean(urlState.receipt) });
}

function setupEvents(): void {
  heroCta.addEventListener("click", () => triggerCottonCandyMoment(TIERS[1].id));

  tierGrid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>(".tier-cta");
    if (!button) {
      return;
    }

    triggerCottonCandyMoment(button.dataset.tierId ?? TIERS[0].id);
  });

  flavorRefresh.addEventListener("click", () => rotateFlavorWall(true));

  shareSite.addEventListener("click", async () => {
    const url = buildCurrentShareUrl();
    await shareLink(url, "Buy Me a Cotton Candy", "Fund top-tier nonsense with this fake checkout.");
  });

  copyShareLink.addEventListener("click", async () => {
    const copied = await copyText(buildCurrentShareUrl());
    showToast(copied ? "Share link copied." : "Copy failed. Try the browser share action.");
  });

  themePicker.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>("[data-theme-id]");
    if (!button) {
      return;
    }

    const themeId = button.dataset.themeId;
    if (!isThemeId(themeId)) {
      return;
    }

    applyTheme(themeId);
  });

  saveTagline.addEventListener("click", () => {
    setTagline(customTaglineInput.value, true);
    showToast("Custom tagline saved.");
  });

  customTaglineInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setTagline(customTaglineInput.value, true);
      showToast("Custom tagline saved.");
    }
  });

  resetCustomization.addEventListener("click", () => {
    applyTheme(DEFAULT_THEME, true);
    setTagline(DEFAULT_TAGLINE, true);
    showToast("Theme and tagline reset.");
  });

  modalClose.addEventListener("click", closeModal);
  modalDone.addEventListener("click", () => triggerCottonCandyMoment(state.activeTierId));

  receiptShare.addEventListener("click", async () => {
    if (!state.lastReceiptCode) {
      showToast("No receipt ready yet.");
      return;
    }

    const url = buildCurrentShareUrl({ includeReceipt: true });
    await shareLink(url, "Pretend receipt", `My fake receipt says ${state.lastReceiptCode}.`);
  });

  celebrationModal.addEventListener("click", (event) => {
    if (event.target === celebrationModal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && celebrationModal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function initialize(): void {
  loadStoredCustomization();
  updateDailyFlavorSection();
  applyUrlState();
  setupEvents();
  updateShareTargets();
}

initialize();
