import "../styles/tokens.css";
import "./prototype.css";
import "./community.css";
import "./budget.css";
import "./core.css";
import "./onboarding.css";
import "./loading.css";
import "./transitions.css";
import { submitPrototypeRequest } from "../api/mocks/prototype";
import { budgetDemo, budgetPresets, budgetRangeValues, budgetScreen, formatBudget } from "./budget";
import { coreDemo, coreScreens, setCoreProduct } from "./core";
import { createApiClient } from "../api/client";
import { createProductsApi } from "../api/products";
import { mockProductsApi } from "../api/mocks/products";
import { bindOnboarding, mountOnboarding, onboardingScreens } from "./onboarding";
import { appendMessage, communityDemo, communityFrames, communityScreens, type CommunityFrame } from "./community";
import { loadingScreen } from "./loading";
import { cancelRequest, notify, runRequest } from "./request-feedback";
import { tradeDemo, tradeFrames, tradeScreens, type TradeFrame } from "./trades";
import { escapeHtml } from "./ui";

const app = document.querySelector<HTMLDivElement>("#app")!;
let frame = "";
let cleanupOnboarding = () => {};
const apiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const productsApi = apiBase ? createProductsApi(createApiClient(apiBase)) : mockProductsApi;
let listRequest = 0;
let loadingTimer: ReturnType<typeof setTimeout>;
let routeFeedback = "";
const screens: Readonly<Record<string, () => string>> = {
  ...onboardingScreens, "01": budgetScreen, ...coreScreens, ...tradeScreens, ...communityScreens,
};

function currentRoute(): string {
  const target = location.hash.slice(1).toLowerCase();
  return Object.hasOwn(screens, target) ? target : "o1";
}

function navigate(target: string): void {
  if (location.hash === `#${target}`) render();
  else location.hash = target;
}

function render(): void {
  cleanupOnboarding();
  const previous = frame;
  frame = currentRoute();
  if (previous !== frame) communityDemo.modal = "";
  if (previous !== frame && frame === "m3") communityDemo.selectedCategory = "";
  if (previous !== frame && frame !== "06") coreDemo.reviewOpen = false;
  const draft = app.querySelector<HTMLInputElement>('#chat-form [name="message"]')?.value;
  const page = (screens[frame] ?? onboardingScreens.o1)();
  app.innerHTML = `<div class="prototype ${previous !== frame ? "screen-enter" : ""}">${page}</div>`;
  cleanupOnboarding = mountOnboarding(app);
  const chatInput = app.querySelector<HTMLInputElement>('#chat-form [name="message"]');
  if (chatInput && previous === frame && draft !== undefined) chatInput.value = draft;
  const dialog = app.querySelector<HTMLElement>("[role=dialog]");
  if (dialog) {
    app.querySelectorAll<HTMLElement>(".appbar, .body > :not(.scrim), .chat-footer, .tabs, .core-screen .footer").forEach((element) => { element.inert = true; });
    dialog.setAttribute("tabindex", "-1");
    dialog.focus();
  }
  if (routeFeedback) { notify(routeFeedback); routeFeedback = ""; }
}

function renderRoute(): void {
  clearTimeout(loadingTimer);
  const target = currentRoute();
  const title = Object.hasOwn(tradeFrames, target) ? tradeFrames[target as TradeFrame]
    : Object.hasOwn(communityFrames, target) ? communityFrames[target as CommunityFrame] : undefined;
  if (!title || target === frame) { render(); return; }
  cleanupOnboarding();
  app.innerHTML = `<div class="prototype">${loadingScreen(target, title)}</div>`;
  loadingTimer = setTimeout(render, 250);
}

function submitRequest(label: string, onSuccess: () => void): void {
  void runRequest(label, submitPrototypeRequest, onSuccess);
}

function updateTrade(label: string, stage: string, success: () => void): void {
  submitRequest(label, () => { tradeDemo.stage = stage; success(); });
}

function runMockRequest(message: string, next: string, after: () => void = () => {}): void {
  submitRequest(message, () => { after(); navigate(next); });
}

async function loadCoreProducts(): Promise<void> {
  const request = ++listRequest;
  coreDemo.listLoading = true;
  coreDemo.listError = "";
  navigate("02");
  try {
    const page = await productsApi.list({ budgetAmount: budgetDemo.amount, rentalDays: coreDemo.rentalDays });
    if (request !== listRequest) return;
    coreDemo.products = page.items;
  } catch (error) {
    if (request !== listRequest) return;
    coreDemo.products = [];
    coreDemo.listError = error instanceof Error ? error.message : "다시 시도해 주세요.";
    notify(coreDemo.listError, "error");
  } finally {
    if (request !== listRequest) return;
    await new Promise(resolve => setTimeout(resolve, 350));
    coreDemo.listLoading = false;
    if (frame === "02") render();
  }
}

async function openCoreProduct(productId: string): Promise<void> {
  await runRequest("제품 정보를 불러오는 중이에요", signal => productsApi.get(productId, signal), detail => {
    coreDemo.selectedId = productId;
    setCoreProduct(detail);
    navigate("03");
  });
}

const actions: Record<string, () => void> = {
  "core-open-product": () => { void openCoreProduct(coreDemo.selectedId); },
  "core-retry-list": () => { void loadCoreProducts(); },
  "core-days-down": () => { coreDemo.rentalDays = Math.max(1, coreDemo.rentalDays - 1); render(); },
  "core-days-up": () => { coreDemo.rentalDays = Math.min(7, coreDemo.rentalDays + 1); render(); },
  "core-request": () => runMockRequest("한번만 요청을 보내는 중이에요", "04"),
  "core-pickup": () => {
    if (!coreDemo.photos.has("pickup")) { notify("가져간 사진을 먼저 올려 주세요.", "error"); return; }
    runMockRequest("수령 사진을 확인하는 중이에요", "05", () => { coreDemo.received = true; });
  },
  "core-return": () => {
    if (!coreDemo.photos.has("return")) { notify("반납한 사진을 먼저 올려 주세요.", "error"); return; }
    runMockRequest("반납을 확인하는 중이에요", "06", () => { coreDemo.returned = true; });
  },
  "core-review": () => { coreDemo.reviewOpen = true; render(); app.querySelector<HTMLTextAreaElement>("#core-review-text")?.focus(); },
  "core-review-close": () => { coreDemo.reviewOpen = false; render(); },
  "core-review-save": () => {
    if (!coreDemo.reviewText.trim()) { notify("후기를 한 글자 이상 입력해 주세요.", "error"); return; }
    coreDemo.reviewText = coreDemo.reviewText.trim();
    coreDemo.reviewSubmitted = true;
    coreDemo.reviewOpen = false;
    render();
    notify("후기를 저장했어요.");
  },
  "budget-custom": () => {
    budgetDemo.custom = true;
    render();
    app.querySelector<HTMLInputElement>("#budget-custom-input")?.focus();
  },
  "budget-continue": () => {
    if (!Number.isFinite(budgetDemo.amount) || budgetDemo.amount < 10_000 || budgetDemo.amount > 1_000_000) {
      notify("예산을 1만 원부터 100만 원까지 입력해 주세요.", "error");
      return;
    }
    void loadCoreProducts();
  },
  "sale-quote": () => submitRequest("결제 정보를 불러오는 중이에요.", () => { tradeDemo.saleQuote = true; tradeDemo.requestChecks = [true, true]; navigate("t2"); }),
  "send-request": () => updateTrade("요청을 보내는 중이에요.", "REQUESTED", () => {
    routeFeedback = "요청을 보냈어요. (프로토타입)";
    navigate(tradeDemo.saleQuote ? "t1" : "t3");
    tradeDemo.saleQuote = false;
  }),
  accept: () => updateTrade("요청을 수락하는 중이에요.", "ACCEPTED", () => navigate("t4")),
  reject: () => updateTrade("요청을 거절하는 중이에요.", "REJECTED", () => notify("요청을 거절했어요.")),
  ready: () => updateTrade("걸어 둔 사진을 등록하는 중이에요.", "READY_FOR_PICKUP", () => notify("걸어 둔 사진을 등록했어요.")),
  complete: () => updateTrade("반납을 확인하는 중이에요.", "COMPLETED", () => notify("반납 확인을 완료했어요.")),
  dispute: () => updateTrade("신고를 접수하는 중이에요.", "DISPUTED", () => notify("파손·분실 신고를 표시했어요. (프로토타입)")),
  "policy-from-form": () => { tradeDemo.policyBack = "t7"; navigate("t9"); },
  "policy-from-block": () => { tradeDemo.policyBack = "t8"; navigate("t9"); },
  "sealed-category": () => { tradeDemo.forms.t7.category = "샴푸"; navigate("t7"); },
};

app.addEventListener("click", (event) => {
  const productCard = (event.target as HTMLElement).closest<HTMLElement>("[data-product-id]");
  if (productCard?.dataset.productId) { void openCoreProduct(productCard.dataset.productId); return; }
  const element = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (element?.dataset.action && (element.dataset.action !== "core-review-close" || element === event.target)) actions[element.dataset.action]?.();
  const budgetPreset = (event.target as HTMLElement).closest<HTMLElement>("[data-budget]");
  if (budgetPreset?.dataset.budget) {
    const amount = Number(budgetPreset.dataset.budget);
    if (budgetPresets.some((preset) => preset === amount)) {
      budgetDemo.amount = amount;
      budgetDemo.custom = false;
      render();
    }
    return;
  }
  const coreTab = (event.target as HTMLElement).closest<HTMLElement>("[data-core-tab]");
  if (coreTab?.dataset.coreTab) {
    coreDemo.tab = coreTab.dataset.coreTab;
    render();
    return;
  }
  const frameLink = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#t2"]');
  if (frameLink) tradeDemo.saleQuote = false;
  const control = (event.target as HTMLElement).closest<HTMLElement>("[data-community]");
  if (!control) return;
  const value = control.dataset.value ?? "";
  switch (control.dataset.community) {
    case "trade-filter": communityDemo.tradeFilter = value; break;
    case "chat-filter": communityDemo.chatFilter = value; break;
    case "experience":
      communityDemo.selectedCategory = communityDemo.selectedCategory === value ? "" : value;
      app.querySelectorAll<HTMLButtonElement>('[data-community="experience"]').forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.value === communityDemo.selectedCategory));
      });
      return;
    case "room":
      communityDemo.roomIndex = Number(value);
      communityDemo.read.add(communityDemo.roomIndex);
      return;
    case "modal": communityDemo.modal = value; break;
    case "close": communityDemo.modal = ""; break;
    default: return;
  }
  render();
});

app.addEventListener("input", (event) => {
  const input = event.target;
  if (input instanceof HTMLTextAreaElement && input.id === "core-review-text") {
    coreDemo.reviewText = input.value;
    return;
  }
  if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
  if (input instanceof HTMLInputElement && (input.id === "budget-range" || input.id === "budget-custom-input")) {
    budgetDemo.amount = input.id === "budget-range"
      ? budgetRangeValues[Number(input.value)] ?? budgetRangeValues[0]
      : Number(input.value);
    if (input.id === "budget-range") budgetDemo.custom = false;
    const display = app.querySelector<HTMLElement>("#budget-amount");
    if (display) display.textContent = formatBudget(budgetDemo.amount);
    if (input.id === "budget-range") {
      const progress = Number(input.value) / (budgetRangeValues.length - 1) * 100;
      input.style.setProperty("--budget-progress", `${progress}%`);
      input.setAttribute("aria-valuetext", formatBudget(budgetDemo.amount));
    }
    return;
  }
  const form = input.form?.dataset.form;
  if (form !== "t6" && form !== "t7") return;
  const fields = tradeDemo.forms[form] as Record<string, string>;
  if (Object.hasOwn(fields, input.name)) fields[input.name] = input.value;
});

app.addEventListener("change", (event) => {
  const input = event.target;
  if (input instanceof HTMLInputElement && (input.id === "budget-range" || input.id === "budget-custom-input")) {
    render();
    return;
  }
  if (input instanceof HTMLSelectElement && input.value === "샴푸 (덜어서 팔기)") {
    navigate("t8");
    return;
  }
  if (!(input instanceof HTMLInputElement)) return;
  if (input.dataset.corePhoto) {
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("이미지 파일을 선택해 주세요.", "error"); return; }
    if (file.size > 10 * 1024 * 1024) { notify("10MB 이하의 사진을 선택해 주세요.", "error"); return; }
    const kind = input.dataset.corePhoto as "pickup" | "return" | "returnExtra";
    const previous = coreDemo.photos.get(kind);
    if (previous) URL.revokeObjectURL(previous);
    coreDemo.photos.set(kind, URL.createObjectURL(file));
    render();
    notify("사진을 추가했어요.");
    return;
  }
  if (input.dataset.check !== undefined) {
    const values = frame === "t2" ? tradeDemo.requestChecks : tradeDemo.itemChecks;
    values[Number(input.dataset.check)] = input.checked;
    const submit = app.querySelector<HTMLButtonElement>(frame === "t2" ? '[data-action="send-request"]' : '[form="listing"]');
    if (submit) submit.disabled = !values.every(Boolean);
  }
  const file = input.files?.[0];
  if (input.hasAttribute("data-chat-photo") && file) {
    input.value = "";
    if (!file.type.startsWith("image/")) { notify("이미지 파일을 선택해 주세요.", "error"); return; }
    submitRequest("사진을 보내는 중이에요.", () => {
      appendMessage({ text: "첨부한 사진", photo: URL.createObjectURL(file) });
      showNewMessage();
    });
    return;
  }
  if (input.dataset.photo && file) {
    if (!file.type.startsWith("image/")) { notify("이미지 파일을 선택해 주세요.", "error"); return; }
    const previous = tradeDemo.photos.get(input.dataset.photo);
    if (previous) URL.revokeObjectURL(previous);
    tradeDemo.photos.set(input.dataset.photo, URL.createObjectURL(file));
    render();
  }
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === "chat-form") {
    event.preventDefault();
    const message = new FormData(form).get("message");
    if (typeof message !== "string" || !message.trim()) { notify("메시지를 입력해 주세요.", "error"); return; }
    submitRequest("메시지를 보내는 중이에요.", () => {
      appendMessage({ text: message.trim() }); form.reset(); showNewMessage();
    });
    return;
  }
  if (form.id === "schedule-form") {
    event.preventDefault();
    const date = new FormData(form).get("date");
    if (typeof date !== "string" || !date) return;
    submitRequest("반납 일정을 저장하는 중이에요.", () => {
      communityDemo.returnDate = date; communityDemo.modal = "";
      appendMessage({ text: `반납 예정일 ${date}` }); showNewMessage();
    });
    return;
  }
  if (form.id !== "listing") return;
  event.preventDefault();
  if (frame === "t7" && !tradeDemo.itemChecks.every(Boolean)) return;
  const title = new FormData(form).get("title");
  if (typeof title !== "string" || !title.trim()) { notify("제품 이름을 입력해 주세요.", "error"); return; }
  submitRequest("물건을 등록하는 중이에요.", () => notify(`${title.trim()} 등록을 확인했어요. (프로토타입)`));
});

app.addEventListener("invalid", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  event.preventDefault();
  notify(input.validationMessage, "error");
  input.focus();
}, true);

function showNewMessage(): void {
  render();
  app.querySelector(".messages .message:last-child")?.scrollIntoView({ block: "nearest" });
  app.querySelector<HTMLInputElement>('#chat-form [name="message"]')?.focus({ preventScroll: true });
}

function setNotificationsOpen(trigger: HTMLButtonElement, open: boolean): void {
  const panel = document.getElementById("notification-popover");
  if (!panel) return;
  panel.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
}

document.addEventListener("click", (event) => {
  const trigger = app.querySelector<HTMLButtonElement>(".notification-trigger");
  const target = event.target;
  if (!trigger || !(target instanceof Element)) return;
  const open = trigger.getAttribute("aria-expanded") === "true";
  if (trigger.contains(target)) setNotificationsOpen(trigger, !open);
  else if (open && !target.closest(".notifications")) setNotificationsOpen(trigger, false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const trigger = app.querySelector<HTMLButtonElement>('.notification-trigger[aria-expanded="true"]');
  if (!trigger) return;
  setNotificationsOpen(trigger, false);
  trigger.focus();
});

app.addEventListener("keydown", (event) => {
  if (app.querySelector(".route-loading")) return;
  if (event.key === "Escape" && coreDemo.reviewOpen) {
    coreDemo.reviewOpen = false;
    render();
    return;
  }
  if (event.key === "Escape" && communityDemo.modal) {
    communityDemo.modal = "";
    render();
    return;
  }
  if (event.key === "Escape" && frame === "t2") navigate(tradeDemo.saleQuote ? "t1" : "03");
  if (event.key === "Escape" && frame === "t8") navigate("t7");
});

window.addEventListener("hashchange", () => {
  cancelRequest();
  renderRoute();
  if (frame === "02" && !coreDemo.listLoading && !coreDemo.listError && coreDemo.products.length === 0) void loadCoreProducts();
  window.scrollTo(0, 0);
});
bindOnboarding(app, render, navigate);
renderRoute();
if (location.hash.toLowerCase() === "#02") void loadCoreProducts();
