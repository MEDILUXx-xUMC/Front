import { escapeHtml, footer, icon, link, notice, rows, screen } from "./ui";
import { mountPolicyReader, onboardingCheck, paymentPolicies, policyReader, terms, type PaymentPolicyId, type TermId } from "./policies";

export const onboardingFrames = {
  o1: "서비스 소개", o2: "서비스 소개 2", o3: "서비스 소개 3", o4: "로그인", o5: "약관 동의",
  "o5-service": "서비스 이용약관 보기", "o5-location": "위치기반서비스 약관 보기", "o5-privacy": "개인정보 수집·이용 보기",
  "o5-address": "주소 제공 동의 보기", "o5-marketing": "혜택·이벤트 알림 보기",
  o6: "내 동네 설정", o7: "동네 인증", o8: "결제수단 등록", "o8-1": "정책 읽기: 보증금", "o8-2": "다 읽음: 보증금",
  "o8-3": "정책 읽기: 문고리 거래 수칙", "o8-4": "다 읽음: 문고리 거래 수칙", "o8-5": "결제수단 등록 (동의 완료)", o9: "권한 안내", o10: "준비 완료",
} as const;
export type OnboardingFrame = keyof typeof onboardingFrames;
const termIds = Object.keys(terms) as TermId[];
const towns = ["사우동", "풍무동", "장기동"] as const;
const state = {
  provider: "카카오", age: false,
  consents: { service: false, location: false, privacy: false, address: false, marketing: false },
  policies: { deposit: false, doorstep: false }, query: "김포", town: "사우동", radius: "1km",
  cardNumber: "", expiry: "", pin: "", cardLast4: "", busy: "", searchLoading: false,
};
let searchTimer: ReturnType<typeof setTimeout>;

function action(label: string, name: string, disabled = false, variant = "primary", value = ""): string {
  return `<button type="button" class="button ${variant}" data-onboarding="${name}" data-value="${value}" ${disabled ? "disabled" : ""}>${label}</button>`;
}
const intro = [
  ["써 보고 싶었던 것,<br>이웃 것으로 한번만", "가까운 이웃의 제품을 사기 전에<br>한 번 써 볼 수 있어요."],
  ["예산 안에서 고르고<br>문고리로 주고받아요", "만나지 않고 문 앞에 걸어 두고 가져가요.<br>보증금은 결제 보류로만 걸려요."],
  ["처음 써 본 것이<br>하나씩 쌓여요", "아직 안 써 본 종류를 칸으로 보여 드려요.<br>빈 칸을 이웃 제품으로 채워 보세요."],
] as const;
function introScreen(index: number): string {
  const [heading, description] = intro[index]!;
  return screen("", `<img class="onboarding-hero" src="${import.meta.env.BASE_URL}figma/o${index + 1}-imgIllustration.png" alt="${["문고리에 걸린 이웃의 물건", "예산을 고르고 문고리로 주고받는 물건", "가까운 동네 지도"][index]}"><div class="onboarding-heading"><h2>${heading}</h2><p>${description}</p></div><nav class="onboarding-dots" aria-label="서비스 소개">${intro.map((_, i) => `<a href="#o${i + 1}" aria-label="서비스 소개 ${i + 1}" ${i === index ? 'aria-current="step"' : ""}></a>`).join("")}</nav>`, { className: "onboarding-screen onboarding-intro", footer: footer(link(index === 2 ? "시작하기" : "다음", `o${index + 2}`) + (index < 2 ? link("건너뛰기", "o4", "onboarding-text-link") : "")) });
}
function loginScreen(): string {
  return screen("", `<div class="onboarding-login"><img src="${import.meta.env.BASE_URL}figma/o4-logo.png" alt="한번만 로고" width="100" height="100"><div class="onboarding-heading"><h2>한번만</h2><p>늘 쓰던 것 말고, 한 번만</p></div></div>`, { className: "onboarding-screen onboarding-login-screen", footer: footer(action(state.busy === "카카오" ? "로그인 중…" : "Kakao 로그인", "login", !!state.busy, "onboarding-kakao", "카카오") + action(state.busy === "Google" ? "로그인 중…" : "Google 로그인", "login", !!state.busy, "secondary", "Google") + '<small class="onboarding-login-note">처음 로그인하면 약관 동의 화면으로 이어져요.</small>') });
}
function requiredConsents(): boolean { return state.age && termIds.every(id => !terms[id].required || state.consents[id]); }
function consentScreen(): string {
  return screen("약관 동의", `<div class="onboarding-heading"><h2>서비스 이용을 위해<br>동의해 주세요</h2></div><div class="onboarding-all">${onboardingCheck("전체 동의", "all", state.age && termIds.every(id => state.consents[id]))}</div><div class="onboarding-terms">${onboardingCheck("만 14세 이상이에요 (필수)", "age", state.age)}${termIds.map(id => `<div class="onboarding-term-row">${onboardingCheck(terms[id].label, id, state.consents[id])}<a class="onboarding-view" href="#o5-${id}" aria-label="${terms[id].title} 보기">보기</a></div>`).join("")}</div>`, { back: "o4", frame: "o5", className: "onboarding-screen onboarding-consent", footer: footer(action("동의하고 계속하기", "consent-next", !requiredConsents())) });
}
function matchingTowns(): readonly string[] {
  const query = state.query.trim().replace(/\s/g, "");
  return query ? towns.filter(town => `경기도김포시${town}`.includes(query)) : towns;
}
function townResults(): string {
  if (state.searchLoading) return `<div class="town-skeleton" role="status" aria-label="동네 검색 중"><span class="sr-only">동네를 찾고 있어요</span>${"<div><i></i><span><b></b><b></b></span></div>".repeat(3)}</div>`;
  const results = matchingTowns();
  return results.length ? `<div role="radiogroup" aria-label="동네 검색 결과">${results.map(town => `<label class="onboarding-town ${state.town === town ? "selected" : ""}"><input type="radio" name="town" value="${town}" ${state.town === town ? "checked" : ""}>${icon(state.town === town ? "o6-imgRadio" : "o6-imgRadio1")}<span><strong>김포시 ${town}</strong><small>경기도 김포시</small></span></label>`).join("")}</div>` : '<p class="town-empty" role="status">검색 결과가 없어요.<br>동네 이름을 다시 입력해 주세요.</p>';
}
function neighborhoodScreen(): string {
  return screen("내 동네 설정", `<div class="onboarding-heading"><h2>어느 동네에서 거래할까요?</h2><p>동네를 인증하면 반경 안 이웃의 제품만 보여요.</p></div>${action(state.busy === "location" ? "동네를 찾고 있어요…" : "현재 위치로 동네 찾기", "find-location", !!state.busy, "onboarding-outline")}<label class="onboarding-field">동네 검색<input type="search" id="town-search" value="${escapeHtml(state.query)}" placeholder="동네 이름을 입력해 주세요" autocomplete="off" aria-controls="town-results"></label><div id="town-results">${townResults()}</div>`, { back: "o5", frame: "o6", className: "onboarding-screen", footer: footer(action(state.town ? `${state.town}으로 설정하기` : "동네를 선택해 주세요", "town-next", !state.town || state.searchLoading)) });
}
function verifyScreen(): string {
  return screen("동네 인증", `<div class="onboarding-map"><small>지도 영역</small><img class="onboarding-radius" src="${import.meta.env.BASE_URL}figma/o7-imgRadius1Km.png" alt="선택한 동네 주변 거래 범위" width="200" height="200"><span class="onboarding-map-pin">${icon("o7-imgGroup1")}</span><span class="onboarding-area">${escapeHtml(state.town)} · 반경 ${state.radius}</span></div><div class="onboarding-location">${icon("o7-imgGroup2")}<span>현재 위치가 김포시 ${escapeHtml(state.town)} 안에 있어요</span></div><div class="onboarding-range"><h3>거래 범위</h3><div class="onboarding-range-chips">${["500m", "1km", "3km"].map(radius => `<button type="button" data-onboarding="radius" data-value="${radius}" aria-pressed="${state.radius === radius}">${radius}</button>`).join("")}</div><small>반경 ${state.radius} 안 이웃의 제품이 보여요. 주소는 거래가 수락된 뒤에만 공개돼요.</small></div>${notice("위치는 동네 인증에만 쓰고 바로 지워요. 위치기반서비스 이용약관에 동의한 경우에만 확인해요.", "o7-imgGroup3")}`, { back: "o6", frame: "o7", className: "onboarding-screen", footer: footer(action(state.busy === "verify" ? "인증하고 있어요…" : "동네 인증 완료", "verify", !!state.busy)) });
}
function validCard(): boolean {
  return /^\d{16}$/.test(state.cardNumber.replace(/\D/g, "")) && /^(0[1-9]|1[0-2])\/\d{2}$/.test(state.expiry) && /^\d{2}$/.test(state.pin);
}
function paymentScreen(donePreview = false): string {
  const agreed = state.policies.deposit && state.policies.doorstep;
  return screen("결제수단 등록", `<div class="onboarding-heading"><h2>보증금을 걸 카드를 등록해 주세요</h2><p>보증금은 결제대행사(PG)를 통해 결제가 보류돼요.<br>한번만은 대금을 보관하지 않아요.</p></div><div class="onboarding-card ${agreed || donePreview ? "compact" : ""}">${agreed || donePreview ? icon("o8-5-imgGroup1") : ""}<span id="card-preview">${state.cardNumber ? `•••• •••• •••• ${escapeHtml(state.cardNumber.replace(/\D/g, "").slice(-4))}` : "카드 번호를 입력하면 여기에 표시돼요"}</span></div><form id="onboarding-card" autocomplete="off"><label class="onboarding-field">카드 번호<input name="cardNumber" inputmode="numeric" maxlength="19" value="${escapeHtml(state.cardNumber)}" placeholder="1234 5678 •••• ••••" aria-describedby="card-note" required></label><div class="two"><label class="onboarding-field">유효기간<input name="expiry" inputmode="numeric" maxlength="5" value="${escapeHtml(state.expiry)}" placeholder="MM/YY" required></label><label class="onboarding-field">비밀번호 앞 2자리<input name="pin" type="password" inputmode="numeric" maxlength="2" value="${escapeHtml(state.pin)}" placeholder="••" required></label></div></form><div class="onboarding-payment-policies">${(["deposit", "doorstep"] as const).map((id, i) => `<a class="onboarding-policy-link" href="#o8-${i === 0 ? 1 : 3}"><span class="check-mark ${state.policies[id] ? "accepted" : ""}">${state.policies[id] ? icon("o5-imgGroup1") : ""}</span><span>${i === 0 ? "보증금 보류·자동 해제 정책" : "문고리 거래 수칙"} (필수)</span><span class="policy-link-action">${state.policies[id] ? "다시 보기" : i === 0 ? "확인하기" : "읽고 동의"}${icon(state.policies[id] ? "o8-5-imgGroup3" : "o8-imgGroup1")}</span></a>`).join("")}<small>${agreed ? "두 정책을 모두 읽고 동의했어요." : "각 정책을 끝까지 읽어야 동의할 수 있어요."}</small></div><p id="card-note" class="sr-only">시연용 등록입니다. 실제 카드 정보는 입력하지 마세요.</p>`, { back: "o7", frame: "o5", className: "onboarding-screen onboarding-payment", footer: footer(action(state.busy === "payment" ? "등록하고 있어요…" : "등록하고 계속하기", "payment-next", !agreed || !validCard() || !!state.busy)) });
}
function permissionScreen(): string {
  const permissions = [["위치 (필수)", "동네 인증을 하고 반경 안 제품을 보여 줄 때 써요."], ["카메라 (필수)", "문고리에 걸어 둔 모습과 반납 상태를 찍을 때 써요."], ["사진 (선택)", "갤러리에서 제품 사진을 고를 때 써요."], ["알림 (선택)", "요청, 걸어 둠, 반납 확인 소식을 알려 드려요."]];
  return screen("권한 안내", `<div class="onboarding-heading"><h2>거래에 필요한 권한을<br>확인해 주세요</h2><p>허용하지 않은 권한은 나중에 설정에서 바꿀 수 있어요.</p></div><div class="onboarding-permissions">${permissions.map(([title, description], i) => `<div><span class="permission-icon">${icon(`o9-imgGroup${i + 1}`)}</span><span><strong>${title}</strong><small>${description}</small></span></div>`).join("")}</div>`, { back: "o8", frame: "o5", className: "onboarding-screen onboarding-permission", footer: footer(link("확인", "o10")) });
}
function readyScreen(): string {
  return screen("", `<div class="onboarding-success">${icon("o10-imgGroup")}</div><div class="onboarding-heading"><h2>준비가 끝났어요</h2><p>이제 예산을 고르고 이웃의 제품을 둘러보세요.</p></div>${rows([["로그인", escapeHtml(state.provider)], ["동네", `김포시 ${escapeHtml(state.town)} · 반경 ${state.radius}`], ["결제수단", state.cardLast4 ? `•••• ${state.cardLast4}` : "등록 전"]], "onboarding-summary")}`, { className: "onboarding-screen onboarding-ready", footer: footer(link("예산 고르러 가기", "01")) });
}
function termReader(id: TermId): string {
  return policyReader(terms[id], { back: "o5", heading: "약관 읽기", confirmLabel: "동의하고 돌아가기", accepted: state.consents[id] });
}
function paymentReader(id: PaymentPolicyId, preview = false): string {
  return policyReader(paymentPolicies[id], { back: "o8", heading: `정책 읽기 (${id === "deposit" ? 1 : 2}/2)`, confirmLabel: id === "deposit" ? "동의하고 다음 정책 읽기" : "동의하고 계속하기", accepted: state.policies[id], preview });
}
export const onboardingScreens: Record<OnboardingFrame, () => string> = {
  o1: () => introScreen(0), o2: () => introScreen(1), o3: () => introScreen(2), o4: loginScreen, o5: consentScreen,
  "o5-service": () => termReader("service"), "o5-location": () => termReader("location"), "o5-privacy": () => termReader("privacy"), "o5-address": () => termReader("address"), "o5-marketing": () => termReader("marketing"),
  o6: neighborhoodScreen, o7: verifyScreen, o8: () => paymentScreen(), "o8-1": () => paymentReader("deposit"), "o8-2": () => paymentReader("deposit", true), "o8-3": () => paymentReader("doorstep"), "o8-4": () => paymentReader("doorstep", true), "o8-5": () => paymentScreen(true), o9: permissionScreen, o10: readyScreen,
};
export function mountOnboarding(root: HTMLElement): () => void {
  const cleanup = mountPolicyReader(root);
  const all = root.querySelector<HTMLInputElement>('[data-onboarding-check="all"]');
  if (all) all.indeterminate = !all.checked && (state.age || termIds.some(id => state.consents[id]));
  return cleanup;
}
export function bindOnboarding(root: HTMLElement, render: () => void, navigate: (frame: string) => void): void {
  const runBusy = (name: string, done: () => void) => {
    if (state.busy) return;
    const route = location.hash;
    state.busy = name; render();
    setTimeout(() => { state.busy = ""; if (location.hash === route) done(); }, 500);
  };
  root.addEventListener("click", event => {
    const control = (event.target as Element).closest<HTMLButtonElement>("[data-onboarding]");
    if (!control || control.disabled) return;
    switch (control.dataset.onboarding) {
      case "login": runBusy(control.dataset.value ?? "카카오", () => { state.provider = control.dataset.value ?? "카카오"; navigate("o5"); }); break;
      case "consent-next": if (requiredConsents()) navigate("o6"); break;
      case "town-next": if (state.town && !state.searchLoading) navigate("o7"); break;
      case "find-location": runBusy("location", () => { state.query = "김포"; state.town = "사우동"; render(); }); break;
      case "radius": state.radius = control.dataset.value ?? "1km"; render(); break;
      case "verify": runBusy("verify", () => navigate("o8")); break;
      case "payment-next":
        if (validCard() && state.policies.deposit && state.policies.doorstep) runBusy("payment", () => { state.cardLast4 = state.cardNumber.replace(/\D/g, "").slice(-4); state.cardNumber = ""; state.expiry = ""; state.pin = ""; navigate("o9"); }); break;
      case "confirm-policy": {
        if (control.dataset.readComplete !== "true") return;
        const route = location.hash.slice(1).toLowerCase();
        const term = route.slice(3);
        if (route.startsWith("o5-") && Object.hasOwn(terms, term)) { state.consents[term as TermId] = true; navigate("o5"); }
        else if (route === "o8-1" || route === "o8-2") { state.policies.deposit = true; navigate(state.policies.doorstep ? "o8-5" : "o8-3"); }
        else { state.policies.doorstep = true; navigate(state.policies.deposit ? "o8-5" : "o8"); }
        break;
      }
    }
  });
  root.addEventListener("change", event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const id = input.dataset.onboardingCheck;
    if (id === "all") { state.age = input.checked; termIds.forEach(id => { state.consents[id] = input.checked; }); }
    else if (id === "age") state.age = input.checked;
    else if (id && Object.hasOwn(terms, id)) state.consents[id as TermId] = input.checked;
    else if (input.name === "town" && towns.some(town => town === input.value)) state.town = input.value;
    else return;
    render();
    root.querySelector<HTMLElement>(id ? `[data-onboarding-check="${id}"]` : 'input[name="town"]:checked')?.focus({ preventScroll: true });
  });
  root.addEventListener("input", event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.id === "town-search") {
      clearTimeout(searchTimer); state.query = input.value; state.searchLoading = true; state.town = "";
      const results = root.querySelector("#town-results");
      if (results) results.innerHTML = townResults();
      const submit = root.querySelector<HTMLButtonElement>('[data-onboarding="town-next"]');
      if (submit) { submit.disabled = true; submit.textContent = "동네를 선택해 주세요"; }
      searchTimer = setTimeout(() => { state.searchLoading = false; if (location.hash === "#o6" && results?.isConnected) results.innerHTML = townResults(); }, 350);
    }
    if (input.form?.id !== "onboarding-card") return;
    if (input.name === "cardNumber") state.cardNumber = input.value = input.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
    if (input.name === "expiry") { const digits = input.value.replace(/\D/g, "").slice(0, 4); state.expiry = input.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits; }
    if (input.name === "pin") state.pin = input.value = input.value.replace(/\D/g, "").slice(0, 2);
    const preview = root.querySelector("#card-preview");
    if (preview) preview.textContent = state.cardNumber ? `•••• •••• •••• ${state.cardNumber.replace(/\D/g, "").slice(-4)}` : "카드 번호를 입력하면 여기에 표시돼요";
    const submit = root.querySelector<HTMLButtonElement>('[data-onboarding="payment-next"]');
    if (submit) submit.disabled = !validCard() || !state.policies.deposit || !state.policies.doorstep || !!state.busy;
  });
  root.addEventListener("submit", event => {
    if ((event.target as HTMLFormElement).id === "onboarding-card") { event.preventDefault(); root.querySelector<HTMLButtonElement>('[data-onboarding="payment-next"]')?.click(); }
  });
}
