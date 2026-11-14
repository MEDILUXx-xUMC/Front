import { escapeHtml, footer, icon, screen } from "./ui";

export interface PolicyDocument {
  title: string;
  sections: ReadonlyArray<readonly [string, string]>;
}

// O5 documents are review copy until the team supplies its approved terms.
export const terms = {
  service: { label: "서비스 이용약관 (필수)", required: true, title: "서비스 이용약관", sections: [
    ["한번만 서비스", "한번만은 가까운 이웃의 제품을 찾아보고, 빌리거나 거래할 수 있도록 연결하는 서비스예요. 예산과 동네를 설정한 다음 이용할 제품과 거래 조건을 확인해 주세요."],
    ["거래 전 확인", "제품 설명과 상태, 사용 기간, 사용료와 보증금을 확인해 주세요. 궁금한 점은 채팅으로 상대에게 확인하고, 거래가 수락되었는지 확인한 뒤 제품을 주고받아요."],
    ["거래와 반납", "문고리에 걸어 둔 모습과 제품 상태를 사진으로 남겨요. 정해진 기간에 같은 장소로 반납하고 반납 사진을 올려 주세요. 보증금과 문고리 거래의 자세한 기준은 별도 정책에서 확인할 수 있어요."],
    ["안전한 이용", "다른 사람의 계정이나 사진을 허락 없이 사용하지 말아 주세요. 사진에는 물건만 나오게 하고, 문패나 택배 송장처럼 개인정보가 담긴 부분은 제외해 주세요."],
    ["문제가 생겼을 때", "물건의 상태나 거래 진행에 문제가 있으면 거래 내역과 사진을 확인해 주세요. 채팅으로 해결하기 어려운 문제는 고객센터에 문의할 수 있어요."],
  ] },
  location: { label: "위치기반서비스 이용약관 (필수)", required: true, title: "위치기반서비스 이용약관", sections: [
    ["위치를 사용하는 목적", "내 동네를 인증하고 설정한 반경 안에 있는 이웃의 제품을 보여 드리기 위해 위치를 확인해요. 위치는 동네 인증에만 쓰고 바로 지워요."],
    ["동네 설정과 인증", "거래할 동네를 검색해 선택한 다음 동네 인증을 진행해 주세요. 위치기반서비스 이용약관에 동의한 경우에만 위치를 확인해요."],
    ["거래 범위", "거래 범위는 500m, 1km, 3km 중에서 고를 수 있어요. 선택한 범위에 따라 둘러볼 수 있는 이웃 제품이 달라져요."],
    ["주소가 보이는 범위", "목록에는 동네와 거리만 보여요. 상세 주소는 거래가 수락된 상대에게만 거래가 끝날 때까지 보여요. 동네 인증과 상세 주소 제공은 각각의 안내를 확인해 주세요."],
    ["권한 변경", "위치 권한은 기기 설정에서 변경할 수 있어요. 위치를 확인할 수 없으면 동네 인증을 완료할 수 없어요. 설정을 확인한 다음 다시 시도해 주세요."],
  ] },
  privacy: { label: "개인정보 수집·이용 (필수)", required: true, title: "개인정보 수집·이용", sections: [
    ["로그인과 서비스 이용", "선택한 소셜 로그인으로 서비스를 시작해요. 프로필과 내 거래 화면에서는 서비스 이용에 필요한 정보를 확인할 수 있어요."],
    ["동네와 거래 정보", "동네 인증과 거래 연결에 필요한 정보를 사용해요. 제품 목록에는 동네와 거리를 표시하고, 거래가 수락된 뒤 상대에게 필요한 주소 정보를 보여 줘요."],
    ["사진과 채팅", "제품 등록과 수령·반납 확인에 올린 사진, 거래를 위해 나눈 채팅을 이용해 거래 상태를 확인해요. 사진과 메시지에 불필요한 개인정보를 담지 말아 주세요."],
    ["결제수단", "결제수단은 보증금과 사용료 결제에 이용해요. 한번만은 대금을 직접 보관하지 않아요. 카드 등록과 결제의 자세한 내용은 결제수단 등록 단계에서 확인해 주세요."],
    ["개인정보 관련 문의", "개인정보 처리에 관한 상세 수집 항목과 보유기간은 서비스에서 제공하는 확정된 개인정보 안내를 확인해 주세요. 개인정보에 관한 문의는 고객센터로 전달할 수 있어요."],
  ] },
  address: { label: "거래가 수락된 상대에게 주소 제공 (필수)", required: true, title: "거래 상대에게 주소 제공", sections: [
    ["주소를 제공받는 사람", "주소는 거래가 수락된 상대에게만 보여요. 제품을 둘러보는 다른 이웃에게는 상세 주소를 공개하지 않아요."],
    ["제공 목적", "문고리에 제품을 걸어 두고 가져가거나 같은 자리에 반납할 수 있도록 거래 장소를 안내해요. 거래를 진행하기 전에 상대와 수령·반납 장소를 확인해 주세요."],
    ["공개 범위와 기간", "목록에는 동네와 거리만 보여요. 상세 주소는 거래가 수락된 뒤부터 거래가 끝날 때까지 상대에게 보여요."],
    ["안전하게 주고받기", "주소는 해당 거래의 수령과 반납을 위해서만 확인해 주세요. 문패, 택배 송장, 사람은 사진에 담지 않고 제품과 제품 상태를 중심으로 촬영해 주세요."],
    ["동의와 확인", "거래 상대에게 주소를 제공하는 안내를 확인한 뒤 동의해 주세요. 문고리 거래의 자세한 방법은 결제수단 등록 단계의 문고리 거래 수칙에서 확인할 수 있어요."],
  ] },
  marketing: { label: "혜택·이벤트 알림 수신 (선택)", required: false, title: "혜택·이벤트 알림 수신", sections: [
    ["어떤 소식을 받나요?", "서비스의 혜택과 이벤트 안내를 받을지 선택할 수 있어요. 거래 요청이나 수령·반납에 관한 안내와 혜택·이벤트 안내는 구분돼요."],
    ["선택 동의", "혜택·이벤트 알림 수신은 선택 항목이에요. 동의하지 않아도 필수 약관에 동의하면 다음 단계로 진행할 수 있어요."],
    ["선택 변경", "약관 동의 화면에서 혜택·이벤트 알림 수신 체크를 선택하거나 해제할 수 있어요. 전체 동의를 선택하면 이 선택 항목도 함께 선택돼요."],
  ] },
} as const;

export type TermId = keyof typeof terms;
export type PaymentPolicyId = "deposit" | "doorstep";

export const paymentPolicies: Record<PaymentPolicyId, PolicyDocument> = {
  deposit: { title: "보증금 결제와 취소 정책", sections: [
    ["보증금이란", "전자제품을 빌릴 때 제품 정가를 기준으로 거는 금액이에요. 한번만은 이 금액을 직접 받거나 보관하지 않고, 결제대행사(PG)가 보관해요."],
    ["결제와 취소", "요청을 보내면 사용료와 보증금이 따로 결제돼요. 주인이 반납을 확인하면 보증금 결제가 취소되고 사용료만 남아요."],
    ["자동 취소", "반납 사진을 올린 뒤 48시간 안에 주인이 이의를 제기하지 않으면 반납이 확인된 것으로 보고 보증금 결제를 취소해요. 카드사 반영까지 약 2~7영업일이 걸려요."],
    ["연체 사용료", "반납 기한을 넘기면 하루 사용료가 더해져요. 연체 사용료는 보증금을 넘을 수 없고, 7일이 지나면 분실 처리 절차로 넘어가요."],
    ["파손과 분실", "차감액은 미리 공개한 차감 기준표에 따라 정해요. 평소처럼 쓰면서 생긴 마모는 차감하지 않아요."],
    ["이의 제기", "차감에 동의하지 않으면 7일 안에 이의를 제기하고 수리 견적서를 낼 수 있어요. 한번만은 거래 당사자가 아니며 당사자 사이를 조정해요."],
  ] },
  doorstep: { title: "문고리 거래 수칙", sections: [
    ["주소 공개", "주소는 거래가 수락된 상대에게만, 거래가 끝날 때까지 보여요. 목록에는 동네와 거리만 보여요."],
    ["걸어 두기", "주인은 걸어 둔 모습과 제품 상태 사진 두 장을 올려요. 사진에는 물건만 나오게 하고 문패, 택배 송장, 사람은 찍지 않아요."],
    ["가져가기와 반납", "걸어 둔 뒤 30분 안에 가져가고 바로 사진을 올려요. 반납 기한까지 같은 자리에 다시 걸고 반납 사진을 올려요."],
    ["거래할 수 없는 물건", "덜어 담은 화장품(샴푸, 린스, 바디워시, 핸드워시), 덜어 담은 주방세제, 덜어 담은 섬유탈취제·섬유유연제·세탁세제, 견본품·사은품·비매품, 사용한 칫솔·면도기·수건, KC 표시가 없거나 개조한 전자제품은 거래할 수 없어요."],
    ["걸어 둔 물건이 없어졌을 때", "가져가기 전에 물건이 없어지면 바로 고객센터로 신고해 주세요. 책임 기준은 이용약관을 따라요."],
  ] },
};

export function onboardingCheck(label: string, name: string, checked = false, disabled = false): string {
  return `<label class="check onboarding-check"><input type="checkbox" data-onboarding-check="${name}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}><span class="check-mark">${icon("o5-imgGroup1")}</span><span>${escapeHtml(label)}</span></label>`;
}

export function policyReader(document: PolicyDocument, options: { back: string; heading: string; confirmLabel: string; accepted: boolean; preview?: boolean }): string {
  const sections = options.preview ? document.sections.slice(-3) : document.sections;
  return screen(options.heading, `
    <div class="read-progress"><span>읽은 정도</span><div class="read-bar" role="progressbar" aria-label="약관 읽은 정도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><output data-read-percent>0%</output></div>
    <article class="policy-scroll" tabindex="0" aria-label="${escapeHtml(document.title)} 본문">
      <div class="policy-heading">${options.preview ? `<p>${escapeHtml(document.title)} (계속)</p>` : `<h2>${escapeHtml(document.title)}</h2><small>시행일 2026년 11월 14일 · 초안</small>`}</div>
      ${sections.map(([heading, text]) => `<section class="policy-section"><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(text)}</p></section>`).join("")}
      <div class="policy-confirm" role="status"><span class="check-mark">${icon("o5-imgGroup1")}</span><span data-read-complete>끝까지 읽으면 동의할 수 있어요</span></div>
    </article>
    <p class="read-hint">아래로 내려 끝까지 읽기</p>
  `, { back: options.back, frame: "o5", className: "onboarding-screen policy-reader", footer: footer(`<button type="button" class="button primary" data-onboarding="confirm-policy" disabled>${options.confirmLabel}</button>`) });
}

/** Mount after each render so progress reflects the actual scrollable text. */
export function mountPolicyReader(root: HTMLElement): () => void {
  const article = root.querySelector<HTMLElement>(".policy-scroll");
  const confirmation = root.querySelector<HTMLElement>(".policy-confirm");
  const submit = root.querySelector<HTMLButtonElement>('[data-onboarding="confirm-policy"]');
  if (!article || !confirmation || !submit) return () => {};
  let reachedEnd = false;
  let active = true;
  const update = () => {
    if (!active) return;
    const distance = Math.max(0, article.scrollHeight - article.clientHeight);
    const atEnd = distance - article.scrollTop <= 1;
    // Only display 100% when the actual bottom is reached, including fractional pixels.
    const percent = atEnd ? 100 : Math.max(0, Math.min(99, Math.floor(article.scrollTop / distance * 100)));
    reachedEnd ||= atEnd;
    const bar = root.querySelector<HTMLElement>(".read-bar");
    bar?.setAttribute("aria-valuenow", String(percent));
    bar?.style.setProperty("--read-progress", `${percent}%`);
    const output = root.querySelector("[data-read-percent]");
    if (output) output.textContent = `${percent}%`;
    const hint = root.querySelector<HTMLElement>(".read-hint");
    if (hint) hint.hidden = reachedEnd;
    confirmation.classList.toggle("is-read", reachedEnd);
    const text = confirmation.querySelector("[data-read-complete]");
    const message = reachedEnd ? "위 내용을 끝까지 읽었어요" : "끝까지 읽으면 동의할 수 있어요";
    if (text && text.textContent !== message) text.textContent = message;
    submit.disabled = !reachedEnd;
    submit.dataset.readComplete = String(reachedEnd);
  };
  article.addEventListener("scroll", update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(article);
  update();
  void document.fonts.ready.then(update);
  return () => { active = false; observer.disconnect(); article.removeEventListener("scroll", update); };
}
