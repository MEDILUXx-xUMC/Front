import "../styles/tokens.css";
import "./prototype.css";
import "./community.css";
import "./loading.css";
import "./transitions.css";
import { submitPrototypeRequest } from "../api/mocks/prototype";
import { appendMessage, communityDemo, communityFrames, communityScreens, type CommunityFrame } from "./community";
import { loadingScreen } from "./loading";
import { cancelRequest, notify, runRequest } from "./request-feedback";
import { tradeDemo, tradeFrames, tradeScreens, type TradeFrame } from "./trades";
import { escapeHtml, screen } from "./ui";

const app = document.querySelector<HTMLDivElement>("#app")!;
let frame = "";
let loadingTimer: ReturnType<typeof setTimeout>;
let routeFeedback = "";
const frames: Readonly<Record<string, string>> = { ...tradeFrames, ...communityFrames };
const frameShortcut = '<a class="frame-shortcut" href="#frames" aria-label="프로토타입 화면 목록">화면 목록</a>';

function navigate(target: string): void {
  if (location.hash === `#${target}`) render();
  else location.hash = target;
}

function hasTradeFrame(value: string): value is TradeFrame {
  return Object.hasOwn(tradeScreens, value);
}

function render(): void {
  const previous = frame;
  frame = location.hash.slice(1).toLowerCase().split("/")[0] || "t1";
  if (previous !== frame) communityDemo.modal = "";
  if (previous !== frame && frame === "m3") communityDemo.selectedCategory = "";
  const draft = app.querySelector<HTMLInputElement>('#chat-form [name="message"]')?.value;
  const index = Object.entries(frames).map(([key, title]) =>
    `<div class="frame-list-row"><a href="#${key}"><b>${key.toUpperCase()}</b><span>${title}</span></a><a href="#${key}/loading" aria-label="${title} 로딩 미리보기">로딩</a></div>`,
  ).join("");
  const community = Object.hasOwn(communityScreens, frame) ? communityScreens[frame as CommunityFrame] : undefined;
  const page = hasTradeFrame(frame) ? tradeScreens[frame]() : community?.() ?? screen("화면 목록", `<div class="frame-list">${index}</div>`);
  app.innerHTML = `<div class="prototype ${previous !== frame ? "screen-enter" : ""}">${page}</div>${frameShortcut}`;
  const chatInput = app.querySelector<HTMLInputElement>('#chat-form [name="message"]');
  if (chatInput && previous === frame && draft !== undefined) chatInput.value = draft;
  const dialog = app.querySelector<HTMLElement>("[role=dialog]");
  if (dialog) {
    app.querySelectorAll<HTMLElement>(".appbar, .body > :not(.scrim), .frame-shortcut, .chat-footer, .tabs").forEach((element) => { element.inert = true; });
    dialog.setAttribute("tabindex", "-1");
    dialog.focus();
  }
  if (routeFeedback) {
    notify(routeFeedback);
    routeFeedback = "";
  }
}

function renderRoute(): void {
  clearTimeout(loadingTimer);
  const [target = "t1", mode] = (location.hash.slice(1).toLowerCase() || "t1").split("/");
  const title = Object.hasOwn(frames, target) ? frames[target] : undefined;
  if (!title || (mode !== "loading" && target === frame)) {
    render();
    return;
  }
  app.innerHTML = `<div class="prototype">${loadingScreen(target, title)}</div>${frameShortcut}`;
  if (mode !== "loading") loadingTimer = setTimeout(render, 250);
}

function submitRequest(label: string, onSuccess: () => void): void {
  void runRequest(label, submitPrototypeRequest, onSuccess);
}

function updateTrade(label: string, stage: string, success: () => void): void {
  submitRequest(label, () => {
    tradeDemo.stage = stage;
    success();
  });
}

const actions: Record<string, () => void> = {
  "sale-quote": () => submitRequest("결제 정보를 불러오는 중이에요.", () => {
    tradeDemo.saleQuote = true;
    tradeDemo.requestChecks = [true, true];
    navigate("t2");
  }),
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
  const element = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (element?.dataset.action) actions[element.dataset.action]?.();
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
  if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
  const form = input.form?.dataset.form;
  if (form !== "t6" && form !== "t7") return;
  const fields = tradeDemo.forms[form] as Record<string, string>;
  if (Object.hasOwn(fields, input.name)) fields[input.name] = input.value;
});

app.addEventListener("change", (event) => {
  const input = event.target;
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
    if (typeof message !== "string" || !message.trim()) {
      notify("메시지를 입력해 주세요.", "error");
      return;
    }
    submitRequest("메시지를 보내는 중이에요.", () => {
      appendMessage({ text: message.trim() });
      form.reset();
      showNewMessage();
    });
    return;
  }
  if (form.id === "schedule-form") {
    event.preventDefault();
    const date = new FormData(form).get("date");
    if (typeof date !== "string" || !date) return;
    submitRequest("반납 일정을 저장하는 중이에요.", () => {
      communityDemo.returnDate = date;
      communityDemo.modal = "";
      appendMessage({ text: `반납 예정일 ${date}` });
      showNewMessage();
    });
    return;
  }
  if (form.id !== "listing") return;
  event.preventDefault();
  if (frame === "t7" && !tradeDemo.itemChecks.every(Boolean)) return;
  const title = new FormData(form).get("title");
  if (typeof title !== "string" || !title.trim()) {
    notify("제품 이름을 입력해 주세요.", "error");
    return;
  }
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
  if (event.key === "Escape" && communityDemo.modal) {
    communityDemo.modal = "";
    render();
    return;
  }
  if (event.key === "Escape" && frame === "t2") navigate(tradeDemo.saleQuote ? "t1" : "frames");
  if (event.key === "Escape" && frame === "t8") navigate("t7");
});

window.addEventListener("hashchange", () => {
  cancelRequest();
  renderRoute();
  window.scrollTo(0, 0);
});
renderRoute();
