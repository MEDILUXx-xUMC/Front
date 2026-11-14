import { link, placeholder, screen } from "./ui";

export const onboardingFrames = {
  o1: "서비스 소개 1", o2: "서비스 소개 2", o3: "서비스 소개 3",
  o4: "로그인", o5: "약관 동의", o6: "내 동네 설정", o7: "동네 인증",
  o8: "결제수단 등록", "o8-1": "보증금 안내", "o8-2": "거래 수칙 1",
  "o8-3": "거래 수칙 2", "o8-4": "문고리 거래 수칙", "o8-5": "결제수단 등록 완료",
  o9: "권한 안내", o10: "준비 완료",
} as const;

export type OnboardingFrame = keyof typeof onboardingFrames;

const intro = [
  ["새로 살까 고민했던 것,\n이웃의 것으로 먼저 써 봐요", "같은 건물 이웃이 쓰는 물건을 하루만 빌려 써 보세요."],
  ["예산 안에서 고르고\n문고리로 주고받아요", "가까운 이웃과 만나지 않고 편하게 거래해요."],
  ["처음 써 본 것이\n새로운 취향이 돼요", "써 보고 나에게 맞는 물건을 찾아보세요."],
] as const;

function introScreen(index: number): string {
  const [heading, description] = intro[index]!;
  const next = `o${index + 2}`;
  return screen("", `
    ${placeholder("서비스 소개 이미지", "onboarding-hero")}
    <div class="onboarding-intro"><h2>${heading.replace("\n", "<br>")}</h2><p>${description}</p></div>
    <div class="onboarding-dots" aria-label="소개 ${index + 1} / 3"><i class="${index === 0 ? "active" : ""}"></i><i class="${index === 1 ? "active" : ""}"></i><i class="${index === 2 ? "active" : ""}"></i></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link(index === 2 ? "시작하기" : "다음", index === 2 ? "o4" : next)}${link("건너뛰기", "o4", "onboarding-text-link")}</footer>` });
}

function loginScreen(): string {
  return screen("", `
    <div class="onboarding-login"><div class="onboarding-logo">한번만</div><h2>한번만 써 보고<br>결정하세요</h2><p>같은 건물 이웃의 물건을 가까이서 경험해요.</p></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("카카오로 시작", "o5")}${link("Google로 시작", "o5", "secondary")}</footer>` });
}

function consentScreen(): string {
  return screen("약관 동의", `
    <div class="onboarding-heading"><h2>서비스 이용을 위해<br>동의해 주세요</h2><p>안전한 이웃 거래를 위한 필수 안내예요.</p></div>
    <div class="onboarding-checks"><label><input type="checkbox" checked> 전체 동의</label><label><input type="checkbox" checked> [필수] 서비스 이용약관</label><label><input type="checkbox" checked> [필수] 개인정보 처리방침</label><label><input type="checkbox" checked> [필수] 문고리 거래 수칙</label></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("동의하고 계속", "o6")}</footer>` });
}

function neighborhoodScreen(): string {
  return screen("내 동네 설정", `
    <div class="onboarding-heading"><h2>어느 동네에 계세요?</h2><p>같은 건물 이웃의 물건을 보여 드릴게요.</p></div>
    <label class="onboarding-field">동네 검색<input type="search" value="김포시 사우동" aria-label="동네 검색"></label>
    <div class="onboarding-location"><strong>김포시 사우동</strong><small>현재 선택한 동네</small></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("이 동네로 설정", "o7")}</footer>` });
}

function verifyScreen(): string {
  return screen("동네 인증", `
    <div class="onboarding-heading"><h2>우리 동네에 계신가요?</h2><p>가까운 이웃끼리 안전하게 거래해요.</p></div>
    ${placeholder("김포시 사우동 지도", "onboarding-map")}
    <div class="onboarding-location"><strong>김포시 사우동</strong><small>시연용 동네 인증이 완료됐어요.</small></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("동네 인증 완료", "o8")}</footer>` });
}

function paymentScreen(): string {
  return screen("결제수단 등록", `
    <div class="onboarding-heading"><h2>보증금 결제수단을<br>등록해 주세요</h2><p>반납이 확인되면 보증금 보류가 풀려요.</p></div>
    <div class="onboarding-card">카드 등록 화면<br><small>결제는 이루어지지 않는 시연용 화면입니다.</small></div>
    <label class="onboarding-field">카드 이름<input value="시연용 카드" aria-label="카드 이름"></label>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("거래 안내 확인", "o8-1")}</footer>` });
}

const policyPages = [
  ["보증금과 사용료를 확인해요", "요청하기 전에 보증금과 사용료를 각각 확인할 수 있어요."],
  ["거래 전 제품 상태를 확인해요", "문고리 거래 전후 사진을 남겨 제품 상태를 확인해요."],
  ["약속한 기간에 반납해요", "사용 기간이 끝나면 같은 장소에 제품을 걸어 두고 사진을 남겨요."],
  ["문고리 거래 수칙을 읽었어요", "서로의 물건을 안전하게 주고받기 위한 약속이에요."],
] as const;

function policyScreen(index: number): string {
  const [heading, description] = policyPages[index]!;
  const next = index === 3 ? "o8-5" : `o8-${index + 2}`;
  return screen("거래 안내", `
    <div class="onboarding-heading"><h2>${heading}</h2><p>${description}</p></div>
    <div class="onboarding-policy"><h3>${heading}</h3><p>${description}</p><p>거래 전 안내를 확인하고 안전하게 이용해 주세요.</p></div>
    <label class="onboarding-agree"><input type="checkbox" checked> 내용을 확인했어요</label>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("확인하고 계속", next)}</footer>` });
}

function paymentDoneScreen(): string {
  return screen("결제수단 등록", `
    <div class="onboarding-heading"><h2>보증금 결제수단을<br>등록해 주세요</h2><p>시연용 카드로 등록 절차를 마쳤어요.</p></div>
    <div class="onboarding-card">시연용 카드<br><small>실제 결제 정보는 입력하거나 저장하지 않습니다.</small></div>
    <div class="onboarding-location"><strong>✓ 거래 수칙 확인 완료</strong><small>이제 다음 단계로 이동할 수 있어요.</small></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("등록 완료", "o9")}</footer>` });
}

function permissionScreen(): string {
  return screen("권한 안내", `
    <div class="onboarding-heading"><h2>가까운 이웃과 안전하게<br>거래하기 위해</h2><p>필요한 기능을 사용할 때 권한을 요청할게요.</p></div>
    <div class="onboarding-permissions"><div>◎ <span><strong>위치</strong><small>동네 확인에 사용해요.</small></span></div><div>▣ <span><strong>사진</strong><small>제품과 문고리 사진을 남겨요.</small></span></div><div>♢ <span><strong>알림</strong><small>거래 진행을 알려 드려요.</small></span></div></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("확인", "o10")}</footer>` });
}

function readyScreen(): string {
  return screen("", `
    <div class="onboarding-ready"><span>✓</span><h2>준비가 끝났어요</h2><p>이제 새로운 제품을 한 번 써 보세요.</p><div class="onboarding-location">김포시 사우동 · 시연용 카드</div></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("예산 고르기", "01")}</footer>` });
}

export const onboardingScreens: Record<OnboardingFrame, () => string> = {
  o1: () => introScreen(0), o2: () => introScreen(1), o3: () => introScreen(2),
  o4: loginScreen, o5: consentScreen, o6: neighborhoodScreen, o7: verifyScreen,
  o8: paymentScreen,
  "o8-1": () => policyScreen(0), "o8-2": () => policyScreen(1),
  "o8-3": () => policyScreen(2), "o8-4": () => policyScreen(3),
  "o8-5": paymentDoneScreen, o9: permissionScreen, o10: readyScreen,
};
