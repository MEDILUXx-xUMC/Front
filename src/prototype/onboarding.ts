import { link, screen } from "./ui";

export const onboardingFrames = {
  o1: "서비스 소개 1", o2: "서비스 소개 2", o3: "서비스 소개 3",
  o4: "로그인", o5: "약관 동의", o6: "내 동네 설정", o7: "동네 인증",
  o8: "결제수단 등록", "o8-1": "정책 읽기: 보증금", "o8-2": "다 읽음: 보증금",
  "o8-3": "정책 읽기: 문고리 거래", "o8-4": "다 읽음: 문고리 거래", "o8-5": "결제수단 등록 완료",
  o9: "권한 안내", o10: "준비 완료",
} as const;

export type OnboardingFrame = keyof typeof onboardingFrames;

const intro = [
  ["써 보고 싶었던 것,\n이웃 것으로 한번만", "가까운 이웃의 제품을 사기 전에\n한 번 써 볼 수 있어요."],
  ["예산 안에서 고르고\n문고리로 주고받아요", "만나지 않고 문 앞에 걸어 두고 가져가요.\n보증금은 결제 보류로만 걸려요."],
  ["처음 써 본 것이\n하나씩 쌓여요", "새로운 물건을 경험하고 나에게 맞는 취향을 찾아보세요."],
] as const;

function introScreen(index: number): string {
  const [heading, description] = intro[index]!;
  const next = `o${index + 2}`;
  return screen("", `
    ${index === 2 ? '<div class="onboarding-hero onboarding-map-art" role="img" aria-label="우리 동네 지도"><span>●</span></div>' : `<div class="onboarding-hero onboarding-door-art ${index === 1 ? "variant-two" : ""}" role="img" aria-label="문고리에 걸린 이웃의 물건"><div class="onboarding-door"><i></i><b></b></div></div>`}
    <div class="onboarding-intro"><h2>${heading.replace("\n", "<br>")}</h2><p>${description.replace("\n", "<br>")}</p></div>
    <div class="onboarding-dots" aria-label="소개 ${index + 1} / 3"><i class="${index === 0 ? "active" : ""}"></i><i class="${index === 1 ? "active" : ""}"></i><i class="${index === 2 ? "active" : ""}"></i></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link(index === 2 ? "시작하기" : "다음", index === 2 ? "o4" : next)}${link("건너뛰기", "o4", "onboarding-text-link")}</footer>` });
}

function loginScreen(): string {
  return screen("", `
    <div class="onboarding-login"><div class="onboarding-logo"><small>한번만</small><b>◉◉</b><span>▰</span></div><h2>한번만</h2><p>늘 쓰던 것 말고, 한 번만</p></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("Kakao 로그인", "o5")}${link("Google 로그인", "o5", "secondary")}<small class="onboarding-login-note">처음 로그인하면 약관 동의 화면으로 이어져요.</small></footer>` });
}

function consentScreen(): string {
  return screen("약관 동의", `
    <div class="onboarding-heading"><h2>서비스 이용을 위해<br>동의해 주세요</h2></div>
    <div class="onboarding-checks"><label class="all"><input type="checkbox" checked> 전체 동의</label>
      <label><input type="checkbox" checked> 만 14세 이상이에요 (필수)</label>
      <label><input type="checkbox" checked> 서비스 이용약관 (필수)<span>보기</span></label>
      <label><input type="checkbox" checked> 위치기반서비스 이용약관 (필수)<span>보기</span></label>
      <label><input type="checkbox" checked> 개인정보 수집·이용 (필수)<span>보기</span></label>
      <label><input type="checkbox" checked> 거래가 수락된 상대에게 주소 제공 (필수)<span>보기</span></label>
      <label><input type="checkbox" checked> 혜택·이벤트 알림 수신 (선택)<span>보기</span></label>
    </div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("동의하고 계속하기", "o6")}</footer>` });
}

function neighborhoodScreen(): string {
  return screen("내 동네 설정", `
    <div class="onboarding-heading"><h2>어느 동네에서 거래할까요?</h2><p>동네를 인증하면 반경 안의 이웃의 제품만 보여요.</p></div>
    <button type="button" class="onboarding-outline">현재 위치로 동네 찾기</button>
    <label class="onboarding-field">동네 검색<input type="search" value="김포" aria-label="동네 검색"></label>
    <div class="onboarding-location-list" role="radiogroup" aria-label="동네 선택">
      <label class="selected"><input type="radio" name="neighborhood" checked><span><strong>김포시 사우동</strong><small>경기도 김포시</small></span></label>
      <label><input type="radio" name="neighborhood"><span><strong>김포시 풍무동</strong><small>경기도 김포시</small></span></label>
      <label><input type="radio" name="neighborhood"><span><strong>김포시 장기동</strong><small>경기도 김포시</small></span></label>
    </div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("사우동으로 설정하기", "o7")}</footer>` });
}

function verifyScreen(): string {
  return screen("동네 인증", `
    <div class="onboarding-verify-map"><div><b>📍</b><small>사우동 · 반경 1km</small></div></div>
    <div class="onboarding-success">◎ &nbsp; 현재 위치가 김포시 사우동 안에 있어요</div>
    <div class="onboarding-range"><strong>거래 범위</strong><div><button type="button">500m</button><button type="button" class="selected">1km</button><button type="button">3km</button></div><small>반경 1km 안의 이웃의 제품이 보여요. 주소는 거래가 수락된 뒤에만 공개돼요.</small></div>
    <div class="budget-notice"><span class="budget-info">i</span><p>위치는 동네 인증에 쓰고 바로 지워요. 위치기반서비스 이용약관에 동의한 경우에만 확인해요.</p></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("동네 인증 완료", "o8")}</footer>` });
}

function paymentScreen(done = false): string {
  return screen("결제수단 등록", `
    <div class="onboarding-heading"><h2>보증금을 걸 카드를 등록해 주세요</h2><p>보증금은 결제 대기(카드 한도 묶기)로만 걸려요.<br>반납하면 대금을 보관하지 않아요.</p></div>
    <div class="onboarding-card"><small>카드 번호를 입력하면 여기에 표시돼요</small></div>
    <label class="onboarding-field">카드 번호<input value="1234 5678 •••• ••••" aria-label="시연용 카드 번호" readonly></label>
    <div class="onboarding-card-fields"><label class="onboarding-field">유효기간<input placeholder="MM/YY" readonly></label><label class="onboarding-field">비밀번호 앞 2자리<input placeholder="••" readonly></label></div>
    <div class="onboarding-policy-links"><div><span class="${done ? "checked" : ""}">✓</span><strong>보증금 보류·자동 해제 정책 (필수)</strong>${link(done ? "다시 보기 ›" : "확인하기 ›", "o8-1", "onboarding-inline")}</div><div><span class="${done ? "checked" : ""}">✓</span><strong>문고리 거래 수칙 (필수)</strong>${link(done ? "다시 보기 ›" : "읽고 동의 ›", "o8-3", "onboarding-inline")}</div></div>
    <small>각 정책을 끝까지 읽어야 동의할 수 있어요.</small>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link(done ? "등록하고 계속하기" : "보증금 정책 읽기", done ? "o9" : "o8-1")}</footer>` });
}

function policyScreen(index: number): string {
  const deposit = index < 2;
  const done = index % 2 === 1;
  const heading = deposit ? "보증금 결제와 취소 정책" : "문고리 거래 수칙";
  const next = index === 3 ? "o8-5" : `o8-${index + 2}`;
  const sections = deposit ? [
    ["보증금이란", "전자제품을 빌릴 때 제품 정가를 기준으로 거는 금액이에요. 한번만은 이 금액을 직접 받거나 보관하지 않고, 결제대행사(PG)가 보관해요."],
    ["결제와 취소", "요청을 보낼 때 사용료와 보증금에 따른 결제 예약이 이루어져요. 반납이 확인되면 보증금 결제가 취소되고 사용료만 남아요."],
    ["자동 취소", "반납 사진을 올린 뒤 48시간 안에 주인이 이의를 제기하지 않으면 보증금 결제를 취소해요."],
    ["연체 사용료", "반납 기한을 넘기면 하루 사용료가 더해져요. 연체 사용료는 보증금을 넘을 수 없어요."],
  ] : [
    ["사진을 남겨 주세요", "문고리에 걸어 두기 전과 가져간 뒤의 상태를 사진으로 남겨 주세요."],
    ["약속한 장소에서 주고받아요", "거래가 수락된 상대에게만 주소가 공개돼요."],
    ["기한 안에 반납해요", "반납 사진을 올리고 주인의 확인을 기다려 주세요."],
    ["문제가 생겼다면", "제품 상태에 이견이 있을 때는 채팅으로 확인하고 신고할 수 있어요."],
  ];
  return screen(`정책 읽기 (${deposit ? "1" : "2"}/2)`, `
    <div class="onboarding-read-progress"><span>읽은 정도</span><div><i style="width:${done ? "100" : "40"}%"></i></div><span>${done ? "100" : "40"}%</span></div>
    <div class="onboarding-policy"><h2>${heading}</h2><small>시행일 2026년 11월 14일 · 초안</small>${sections.map(([title, copy]) => `<section><h3>${title}</h3><p>${copy}</p></section>`).join("")}</div>
    ${done ? '<label class="onboarding-agree"><input type="checkbox" checked> 위 내용을 끝까지 읽고 이해했어요</label>' : '<div class="onboarding-read-hint">아래로 내려 끝까지 읽기</div>'}
  `, { className: "onboarding-screen onboarding-policy-screen", footer: `<footer class="footer">${link(done ? (deposit ? "동의하고 다음 정책 읽기" : "동의하고 계속하기") : "끝까지 읽었어요", next)}</footer>` });
}

function permissionScreen(): string {
  return screen("권한 안내", `
    <div class="onboarding-heading"><h2>거래에 필요한 권한을<br>확인해 주세요</h2><p>허용하지 않은 권한은 나중에 설정에서 바꿀 수 있어요.</p></div>
    <div class="onboarding-permissions"><div>◎ <span><strong>위치 (필수)</strong><small>동네 인증을 하고 반경 안 제품을 보여 줄 때 써요.</small></span></div><div>▣ <span><strong>카메라 (필수)</strong><small>문고리에 걸어 둔 모습과 반납 상태를 찍을 때 써요.</small></span></div><div>▧ <span><strong>사진 (선택)</strong><small>갤러리에서 제품 사진을 고를 때 써요.</small></span></div><div>♧ <span><strong>알림 (선택)</strong><small>요청, 걸어 둠, 반납 확인 소식을 알려 드려요.</small></span></div></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("확인", "o10")}</footer>` });
}

function readyScreen(): string {
  return screen("", `
    <div class="onboarding-ready"><span>✓</span><h2>준비가 끝났어요</h2><p>이제 예산을 고르고 이웃의 제품을 둘러보세요.</p><dl class="onboarding-summary"><div><dt>로그인</dt><dd>카카오</dd></div><div><dt>동네</dt><dd>김포시 사우동 · 반경 1km</dd></div><div><dt>결제수단</dt><dd>•••• 5678</dd></div></dl></div>
  `, { className: "onboarding-screen", footer: `<footer class="footer">${link("예산 고르러 가기", "01")}</footer>` });
}

export const onboardingScreens: Record<OnboardingFrame, () => string> = {
  o1: () => introScreen(0), o2: () => introScreen(1), o3: () => introScreen(2),
  o4: loginScreen, o5: consentScreen, o6: neighborhoodScreen, o7: verifyScreen,
  o8: paymentScreen,
  "o8-1": () => policyScreen(0), "o8-2": () => policyScreen(1),
  "o8-3": () => policyScreen(2), "o8-4": () => policyScreen(3),
  "o8-5": () => paymentScreen(true), o9: permissionScreen, o10: readyScreen,
};
