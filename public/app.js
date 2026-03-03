const SITE_CONTENT = {
  tiers: [
    {
      id: "mini-puff",
      title: "Mini Puff",
      priceLabel: "$3",
      joke: "A polite cotton cloud for morally supporting my absurd internet projects.",
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
  ],
  testimonials: [
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
  ],
  faq: [
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
  ],
  flavorMessages: [
    "Blue Raspberry Breeze approved your support request.",
    "Cotton Candy Comet says your generosity is fluffing the timeline.",
    "Sea-Salt Sky flavor unlocked one bonus internet idea.",
    "Your sugar cloud has been promoted to premium altitude.",
    "Cloud Machine reports perfect swirl conditions for your contribution.",
    "Flavor analysts confirm this was an elite pretend purchase."
  ]
};

const state = {
  wallFlavorIndex: -1,
  celebrationFlavorIndex: -1,
  activeTierId: SITE_CONTENT.tiers[0].id,
  processingTimer: null,
  confettiTimer: null,
  toastTimer: null
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const heroCta = document.getElementById("hero-cta");
const navCta = document.getElementById("nav-cta");
const tierGrid = document.getElementById("tier-grid");
const testimonialGrid = document.getElementById("testimonial-grid");
const faqList = document.getElementById("faq-list");
const flavorWall = document.getElementById("flavor-wall");
const flavorRefresh = document.getElementById("flavor-refresh");
const toast = document.getElementById("toast");
const confettiOverlay = document.getElementById("confetti-overlay");

const celebrationModal = document.getElementById("celebration-modal");
const modalPanel = celebrationModal.querySelector(".modal-panel");
const modalClose = document.getElementById("modal-close");
const modalDone = document.getElementById("modal-done");
const modalTitle = document.getElementById("celebration-title");
const modalMessage = document.getElementById("modal-message");
const receiptId = document.getElementById("receipt-id");
const receiptDate = document.getElementById("receipt-date");
const receiptStatus = document.getElementById("receipt-status");
const receiptItem = document.getElementById("receipt-item");
const receiptItemPrice = document.getElementById("receipt-item-price");
const receiptFee = document.getElementById("receipt-fee");
const receiptTax = document.getElementById("receipt-tax");
const receiptTotal = document.getElementById("receipt-total");
const receiptNote = document.getElementById("receipt-note");
const confettiZone = document.getElementById("confetti-zone");

function renderTiers() {
  tierGrid.innerHTML = "";

  SITE_CONTENT.tiers.forEach((tier) => {
    const card = document.createElement("article");
    card.className = "tier-card";
    card.innerHTML = `
      <h3>${tier.title}</h3>
      <p class="tier-price">${tier.priceLabel}</p>
      <p class="tier-joke">${tier.joke}</p>
      <button class="button button-small tier-cta" type="button" data-tier-id="${tier.id}">${tier.ctaLabel}</button>
    `;
    tierGrid.append(card);
  });
}

function renderTestimonials() {
  testimonialGrid.innerHTML = "";

  SITE_CONTENT.testimonials.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "testimonial-card";
    card.innerHTML = `<p>"${entry.text}"</p><span>${entry.name}</span>`;
    testimonialGrid.append(card);
  });
}

function renderFaq() {
  faqList.innerHTML = "";

  SITE_CONTENT.faq.forEach((item) => {
    const details = document.createElement("details");
    details.className = "faq-item";
    details.innerHTML = `<summary>${item.q}</summary><p>${item.a}</p>`;
    faqList.append(details);
  });
}

function findTier(tierId) {
  return SITE_CONTENT.tiers.find((tier) => tier.id === tierId) ?? SITE_CONTENT.tiers[0];
}

function randomIndex(length, previousIndex) {
  if (length <= 1) {
    return 0;
  }

  let index = Math.floor(Math.random() * length);
  while (index === previousIndex) {
    index = Math.floor(Math.random() * length);
  }
  return index;
}

function nextFlavor(target) {
  const key = target === "wall" ? "wallFlavorIndex" : "celebrationFlavorIndex";
  const index = randomIndex(SITE_CONTENT.flavorMessages.length, state[key]);
  state[key] = index;
  return SITE_CONTENT.flavorMessages[index];
}

function buildReceiptCode() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const serial = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CANDY-${stamp}-${serial}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatReceiptDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getReceiptBreakdown(tier) {
  const subtotal = Number.parseFloat(tier.priceLabel.replace(/[^0-9.]/g, "")) || 0;
  const serviceFee = subtotal >= 10 ? 0.99 : 0.69;
  const tax = Number(((subtotal + serviceFee) * 0.0825).toFixed(2));
  const total = Number((subtotal + serviceFee + tax).toFixed(2));
  return { subtotal, serviceFee, tax, total };
}

function renderReceipt(tier, { code, status, note }) {
  const now = new Date();
  const { subtotal, serviceFee, tax, total } = getReceiptBreakdown(tier);

  receiptId.textContent = code;
  receiptDate.textContent = formatReceiptDate(now);
  receiptStatus.textContent = status;
  receiptItem.textContent = `${tier.title} cotton candy`;
  receiptItemPrice.textContent = formatCurrency(subtotal);
  receiptFee.textContent = formatCurrency(serviceFee);
  receiptTax.textContent = formatCurrency(tax);
  receiptTotal.textContent = formatCurrency(total);
  receiptNote.textContent = note;
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  state.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function updateFlavorWall(manual = false) {
  const message = nextFlavor("wall");
  flavorWall.textContent = `"${message}"`;

  if (manual) {
    showToast("Flavor wall shuffled.");
  }
}

function openModal() {
  celebrationModal.classList.add("is-open");
  celebrationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalPanel.focus();
}

function closeModal() {
  clearTimeout(state.processingTimer);
  clearTimeout(state.confettiTimer);
  celebrationModal.classList.remove("is-open");
  celebrationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  confettiOverlay.classList.remove("is-active");
  confettiOverlay.textContent = "";
}

function clearConfettiZone() {
  confettiZone.textContent = "";
}

function clearConfettiOverlay() {
  clearTimeout(state.confettiTimer);
  confettiOverlay.classList.remove("is-active");
  confettiOverlay.textContent = "";
}

function paintConfetti() {
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

  state.confettiTimer = setTimeout(() => {
    clearConfettiOverlay();
  }, 3400);
}

function showProcessing(tier) {
  modalDone.hidden = true;
  modalTitle.textContent = "Spinning sugar machine...";
  modalMessage.textContent = `Whipping up a ${tier.title} cloud. Please enjoy this dramatic fake wait.`;
  renderReceipt(tier, {
    code: "Pending...",
    status: "Authorizing...",
    note: "Simulated checkout in progress. No real funds are moving."
  });
  clearConfettiZone();
}

function showSuccess(tier) {
  const flavorMessage = nextFlavor("celebration");
  const fauxReceiptCode = buildReceiptCode();
  modalDone.hidden = false;
  modalTitle.textContent = "Cotton candy acquired";
  modalMessage.textContent = `${flavorMessage}`;
  renderReceipt(tier, {
    code: fauxReceiptCode,
    status: "Approved (simulated)",
    note: "Parody receipt only. Your actual charge is $0.00."
  });
  paintConfetti();
  showToast(`${tier.title} delivered. Zero dollars charged.`);
}

function triggerCottonCandyMoment(tierId) {
  const tier = findTier(tierId);
  state.activeTierId = tier.id;

  openModal();
  showProcessing(tier);

  const delay = 1100 + Math.floor(Math.random() * 700);
  clearTimeout(state.processingTimer);

  state.processingTimer = setTimeout(() => {
    showSuccess(tier);
  }, delay);
}

window.triggerCottonCandyMoment = triggerCottonCandyMoment;

function setupEvents() {
  heroCta.addEventListener("click", () => triggerCottonCandyMoment(SITE_CONTENT.tiers[1].id));
  navCta.addEventListener("click", () => triggerCottonCandyMoment(SITE_CONTENT.tiers[0].id));

  tierGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".tier-cta");
    if (!button) {
      return;
    }

    triggerCottonCandyMoment(button.dataset.tierId);
  });

  flavorRefresh.addEventListener("click", () => updateFlavorWall(true));

  modalClose.addEventListener("click", closeModal);
  modalDone.addEventListener("click", () => triggerCottonCandyMoment(state.activeTierId));

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

function initialize() {
  renderTiers();
  renderTestimonials();
  renderFaq();
  updateFlavorWall();
  setupEvents();

  window.setInterval(() => {
    updateFlavorWall(false);
  }, 7000);
}

initialize();
