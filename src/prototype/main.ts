import "../styles/tokens.css";
import "./prototype.css";
import "./community.css";
import "./budget.css";
import "./core.css";
import "./onboarding.css";
import { budgetDemo, budgetFrames, budgetPresets, budgetRangeValues, budgetScreen, formatBudget } from "./budget";
import { coreDemo, coreFrames, coreScreens, type CoreFrame } from "./core";
import { bindOnboarding, mountOnboarding, onboardingFrames, onboardingScreens, type OnboardingFrame } from "./onboarding";
import { appendMessage, communityDemo, communityFrames, communityScreens, type CommunityFrame } from "./community";
import { tradeDemo, tradeFrames, tradeScreens, type TradeFrame } from "./trades";
import { escapeHtml, screen } from "./ui";

const app = document.querySelector<HTMLDivElement>("#app")!;
let frame = "";
let feedbackTimer: ReturnType<typeof setTimeout>;
let cleanupOnboarding = () => {};

function navigate(target: string): void {
  if (location.hash === `#${target}`) render();
  else location.hash = target;
}

function hasTradeFrame(value: string): value is TradeFrame {
  return Object.hasOwn(tradeScreens, value);
}

function hasCoreFrame(value: string): value is CoreFrame {
  return Object.hasOwn(coreScreens, value);
}

function hasOnboardingFrame(value: string): value is OnboardingFrame {
  return Object.hasOwn(onboardingScreens, value);
}

function render(): void {
  cleanupOnboarding();
  const previous = frame;
  frame = location.hash.slice(1).toLowerCase() || "o1";
  if (previous !== frame) communityDemo.modal = "";
  const draft = app.querySelector<HTMLInputElement>('#chat-form [name="message"]')?.value;
  const index = Object.entries({ ...onboardingFrames, ...budgetFrames, ...coreFrames, ...tradeFrames, ...communityFrames }).map(([key, title]) =>
    `<a href="#${key}"><b>${key.toUpperCase()}</b><span>${title}</span></a>`,
  ).join("");
  const community = Object.hasOwn(communityScreens, frame) ? communityScreens[frame as CommunityFrame] : undefined;
  const page = hasOnboardingFrame(frame) ? onboardingScreens[frame]()
    : frame === "01" ? budgetScreen() : hasCoreFrame(frame) ? coreScreens[frame]()
    : hasTradeFrame(frame) ? tradeScreens[frame]() : community?.() ?? screen("화면 목록", `<div class="frame-list">${index}</div>`);
  app.innerHTML = `<div class="prototype">${page}</div><a class="frame-shortcut" href="#frames" aria-label="프로토타입 화면 목록">화면 목록</a><div id="feedback" role="status"></div>`;
  cleanupOnboarding = mountOnboarding(app);
  const chatInput = app.querySelector<HTMLInputElement>('#chat-form [name="message"]');
  if (chatInput && previous === frame && draft !== undefined) chatInput.value = draft;
  const dialog = app.querySelector<HTMLElement>("[role=dialog]");
  if (dialog) {
    app.querySelectorAll<HTMLElement>(".appbar, .body > :not(.scrim), .frame-shortcut, .chat-footer, .tabs").forEach((element) => { element.inert = true; });
    dialog.setAttribute("tabindex", "-1");
    dialog.focus();
  }
}

function notify(message: string): void {
  const status = document.querySelector<HTMLElement>("#feedback")!;
  status.textContent = message;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { status.textContent = ""; }, 3500);
}

const actions: Record<string, () => void> = {
  "core-open-product": () => navigate("03"),
  "core-days-down": () => { coreDemo.rentalDays = Math.max(1, coreDemo.rentalDays - 1); render(); },
  "core-days-up": () => { coreDemo.rentalDays = Math.min(7, coreDemo.rentalDays + 1); render(); },
  "core-request": () => navigate("04"),
  "core-pickup": () => { coreDemo.received = true; navigate("05"); },
  "core-return": () => { coreDemo.returned = true; navigate("06"); },
  "core-review": () => notify("후기를 남겼어요. (프로토타입)"),
  "budget-custom": () => {
    budgetDemo.custom = true;
    render();
    app.querySelector<HTMLInputElement>("#budget-custom-input")?.focus();
  },
  "budget-continue": () => {
    if (!Number.isFinite(budgetDemo.amount) || budgetDemo.amount < 10_000 || budgetDemo.amount > 1_000_000) {
      notify("예산을 1만 원부터 100만 원까지 입력해 주세요.");
      return;
    }
    navigate("02");
  },
  "sale-quote": () => { tradeDemo.saleQuote = true; tradeDemo.requestChecks = [true, true]; navigate("t2"); },
  "send-request": () => {
    tradeDemo.stage = "REQUESTED";
    navigate(tradeDemo.saleQuote ? "t1" : "t3");
    tradeDemo.saleQuote = false;
    setTimeout(() => notify("요청을 보냈어요. (프로토타입)"), 100);
  },
  accept: () => { tradeDemo.stage = "ACCEPTED"; navigate("t4"); },
  reject: () => { tradeDemo.stage = "REJECTED"; notify("요청을 거절했어요."); },
  ready: () => { tradeDemo.stage = "READY_FOR_PICKUP"; notify("걸어 둔 사진을 등록했어요."); },
  complete: () => { tradeDemo.stage = "COMPLETED"; notify("반납 확인을 완료했어요."); },
  dispute: () => { tradeDemo.stage = "DISPUTED"; notify("파손·분실 신고를 표시했어요. (프로토타입)"); },
  "policy-from-form": () => { tradeDemo.policyBack = "t7"; navigate("t9"); },
  "policy-from-block": () => { tradeDemo.policyBack = "t8"; navigate("t9"); },
  "sealed-category": () => { tradeDemo.forms.t7.category = "샴푸"; navigate("t7"); },
};

app.addEventListener("click", (event) => {
  const element = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (element?.dataset.action) actions[element.dataset.action]?.();
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
  if (input.dataset.check !== undefined) {
    const values = frame === "t2" ? tradeDemo.requestChecks : tradeDemo.itemChecks;
    values[Number(input.dataset.check)] = input.checked;
    const submit = app.querySelector<HTMLButtonElement>(frame === "t2" ? '[data-action="send-request"]' : '[form="listing"]');
    if (submit) submit.disabled = !values.every(Boolean);
  }
  const file = input.files?.[0];
  if (input.hasAttribute("data-chat-photo") && file) {
    if (!file.type.startsWith("image/")) { notify("이미지 파일을 선택해 주세요."); return; }
    appendMessage({ text: "첨부한 사진", photo: URL.createObjectURL(file) });
    showNewMessage();
    return;
  }
  if (input.dataset.photo && file) {
    if (!file.type.startsWith("image/")) { notify("이미지 파일을 선택해 주세요."); return; }
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
    if (typeof message !== "string" || !message.trim()) return;
    appendMessage({ text: message.trim() });
    form.reset();
    showNewMessage();
    return;
  }
  if (form.id === "schedule-form") {
    event.preventDefault();
    const date = new FormData(form).get("date");
    if (typeof date !== "string" || !date) return;
    communityDemo.returnDate = date;
    communityDemo.modal = "";
    appendMessage({ text: `반납 예정일 ${date}` });
    showNewMessage();
    return;
  }
  if (form.id !== "listing") return;
  event.preventDefault();
  if (frame === "t7" && !tradeDemo.itemChecks.every(Boolean)) return;
  const title = new FormData(form).get("title");
  notify(`${typeof title === "string" && title.trim() ? title.trim() : "제품"} 등록을 확인했어요. (프로토타입)`);
});

function showNewMessage(): void {
  render();
  app.querySelector(".messages .message:last-child")?.scrollIntoView({ block: "nearest" });
  app.querySelector<HTMLInputElement>('#chat-form [name="message"]')?.focus({ preventScroll: true });
}

app.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && communityDemo.modal) {
    communityDemo.modal = "";
    render();
    return;
  }
  if (event.key === "Escape" && frame === "t2") navigate(tradeDemo.saleQuote ? "t1" : "frames");
  if (event.key === "Escape" && frame === "t8") navigate("t7");
});

window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
});
bindOnboarding(app, render, navigate);
render();
