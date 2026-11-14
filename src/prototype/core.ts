import { budgetDemo, formatBudget } from "./budget";
import { button, footer, link, placeholder, rows, screen, tag } from "./ui";

export const coreFrames = {
  "02": "제품 목록", "03": "한번만 요청", "04": "문고리 수령",
  "05": "반납하기", "06": "반납 확인 완료",
} as const;

export type CoreFrame = keyof typeof coreFrames;
export const coreDemo = { tab: "전체", rentalDays: 2, received: false, returned: false };

const product = {
  title: "기계식 키보드 (저소음 적축)",
  distance: "0.4km · 6개월째 사용 중",
  deposit: 45_000,
  dailyFee: 2_000,
};

function productList(): string {
  const tabs = ["전체", "전자제품 대여", "미개봉 생활용품"].map((label) =>
    `<button class="core-tab ${coreDemo.tab === label ? "active" : ""}" type="button" data-core-tab="${label}" aria-pressed="${coreDemo.tab === label}">${label}</button>`,
  ).join("");
  const keyboard = `<button class="core-product" type="button" data-action="core-open-product">
    ${placeholder("사진", "core-thumb")}
    <span>${tag("대여", "brand")}<strong>${product.title}</strong><small>사용료 · ${product.distance}</small><b>보증금 ${formatBudget(product.deposit)} · 하루 ${formatBudget(product.dailyFee)}</b></span>
  </button>`;
  const samples = [
    ["섬유유연제 코튼 향 1회분", "1,500원"],
    ["허브 샴푸 여행용 1회분", "1,200원"],
  ].map(([title, price]) => `<div class="core-product core-sample">
    ${placeholder("사진", "core-thumb")}
    <span>${tag("미개봉", "neutral")}<strong>${title}</strong><small>이웃이 쓰는 생활용품</small><b>${price}</b></span>
  </div>`).join("");
  const showRental = coreDemo.tab !== "미개봉 생활용품";
  const showSamples = coreDemo.tab !== "전자제품 대여";
  const keyboardVisible = showRental && product.deposit + product.dailyFee * coreDemo.rentalDays <= budgetDemo.amount;
  const count = Number(keyboardVisible) + (showSamples ? 2 : 0);
  return screen("김포시 사우동", `
    <div class="core-budget-bar"><span>예산 ${formatBudget(budgetDemo.amount)} 안에서 보는 중</span>${link("변경", "01", "core-change")}</div>
    <div class="core-tabs" role="group" aria-label="제품 종류">${tabs}</div>
    <div class="core-list-heading"><h2>이웃이 쓰는 것 ${count}개</h2><small>아직 안 써 본 제품부터 보여 드려요</small></div>
    <div class="core-products">${keyboardVisible ? keyboard : ""}${showSamples ? samples : ""}${count === 0 ? `<div class="panel"><strong>예산 안의 제품이 없어요</strong><small>예산을 바꾸면 더 많은 제품을 볼 수 있어요.</small></div>` : ""}</div>
  `, { className: "core-screen" });
}

function requestScreen(): string {
  const usageFee = product.dailyFee * coreDemo.rentalDays;
  const total = product.deposit + usageFee;
  return screen("한번만 요청", `
    ${placeholder("제품 사진", "core-hero")}
    <div class="core-product-detail">${tag("대여", "brand")}<h2>${product.title}</h2><small>사용료 · ${product.distance}</small></div>
    <div class="core-quote">“타건 소리가 조용한 편이에요. 밤에 써도 좋을 것 같아요.”</div>
    <div class="core-duration"><span>사용 기간</span><div class="core-stepper">
      <button type="button" data-action="core-days-down" aria-label="사용 기간 하루 줄이기">−</button>
      <strong>${coreDemo.rentalDays}일</strong>
      <button type="button" data-action="core-days-up" aria-label="사용 기간 하루 늘리기">＋</button>
    </div></div>
    ${rows([["보증금 (결제 보류)", formatBudget(product.deposit)], [`사용료 (하루 ${formatBudget(product.dailyFee)} × ${coreDemo.rentalDays}일)`, formatBudget(usageFee)]], "core-price-rows")}
    <div class="core-total"><span>예산 대비</span><b>${formatBudget(total)} / ${formatBudget(budgetDemo.amount)}</b></div>
    <div class="core-progress"><span style="width: ${Math.min(100, total / budgetDemo.amount * 100)}%"></span></div>
  `, { frame: "t1", back: "02", className: "core-screen", footer: footer(button("한번만 써 볼게요", "core-request", "primary", total > budgetDemo.amount)) });
}

function pickupScreen(): string {
  return screen("내 거래", `
    <div class="core-trade-card">${placeholder("사진", "core-thumb")}<div>${tag("진행 중", "brand")}<strong>${product.title}</strong><small>사용 기간 ${coreDemo.rentalDays}일 · 보증금 ${formatBudget(product.deposit)} 보류 중</small></div></div>
    <ol class="core-status-list">
      <li class="done"><span>✓</span><div><b>요청 수락</b><small>주인이 수락하고 준비 중이에요.</small></div></li>
      <li class="done"><span>✓</span><div><b>문고리에 걸어 둠</b><small>사진을 확인하고 가져가 주세요.</small></div></li>
      <li class="current"><span>3</span><div><b>가져가기</b><small>가져간 사진을 남겨 주세요.</small></div></li>
      <li><span>4</span><div><b>반납</b><small>반납 기한 전에 다시 문고리에 걸어 주세요.</small></div></li>
      <li><span>5</span><div><b>반납 확인</b><small>주인이 확인하면 보증금 보류가 풀려요.</small></div></li>
    </ol>
    <div class="core-photo-pair"><div class="core-photo done">✓<span>걸어 둔 사진</span></div><div class="core-photo">▣<span>가져간 사진 추가</span></div></div>
  `, { frame: "t1", back: "03", className: "core-screen", footer: footer(button("가져갔어요", "core-pickup")) });
}

function returnScreen(): string {
  return screen("반납하기", `
    <div class="core-list-heading"><h2>다시 문고리에 걸어 두고 사진을 남겨 주세요</h2><small>반납 사진은 다른 이웃을 위한 증거예요.</small></div>
    <div class="core-photo-pair"><div class="core-photo done">✓<span>반납한 사진</span></div><div class="core-photo">▣<span>추가 사진 선택</span></div></div>
    <div class="core-trade-card">${placeholder("사진", "core-thumb")}<div><strong>${product.title}</strong><small>사용 기간 ${coreDemo.rentalDays}일</small><small>반납 기한 · 11월 16일 21:00</small></div></div>
    ${rows([["보증금", formatBudget(product.deposit)], ["결제될 사용료", formatBudget(product.dailyFee * coreDemo.rentalDays)]], "panel")}
    <div class="budget-notice"><span class="budget-info">i</span><p>주인이 반납을 확인하면 보증금 보류가 풀려요.</p></div>
  `, { frame: "t1", back: "04", className: "core-screen", footer: footer(button("반납 완료", "core-return")) });
}

function completeScreen(): string {
  return screen("반납 확인 완료", `
    <div class="core-complete"><span class="core-check">✓</span><h2>보증금 보류가 풀렸어요</h2><p>주인이 반납을 확인했어요.</p></div>
    ${rows([["보증금 보류 해제", formatBudget(product.deposit)], ["결제한 사용료", formatBudget(product.dailyFee * coreDemo.rentalDays)]], "panel")}
    <div class="core-experience"><h3>지금까지 처음 써 본 것 3개</h3><div>${tag("처음 써본 키보드", "neutral")}${tag("새로운 취향", "success")}</div><p>한 줄 후기를 남겨 주세요.</p><textarea aria-label="한 줄 후기" placeholder="어땠는지 짧게 남겨 주세요"></textarea></div>
  `, { className: "core-screen", footer: footer(`${button("후기 남기기", "core-review")}${link("홈으로", "01", "core-home")}`) });
}

export const coreScreens: Record<CoreFrame, () => string> = {
  "02": productList,
  "03": requestScreen,
  "04": pickupScreen,
  "05": returnScreen,
  "06": completeScreen,
};
