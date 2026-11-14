import { budgetDemo, formatBudget } from "./budget";
import { button, escapeHtml, footer, icon, link, placeholder, rows, screen, tag } from "./ui";
import type { Product, ProductDetail } from "../types/product";

export const coreFrames = {
  "02": "제품 목록", "03": "한번만 요청", "04": "문고리 수령",
  "05": "반납하기", "06": "반납 확인 완료",
} as const;

export type CoreFrame = keyof typeof coreFrames;
export const coreDemo = {
  tab: "전체", rentalDays: 2, received: false, returned: false,
  listLoading: false, pending: "", reviewOpen: false, reviewText: "", reviewSubmitted: false,
  products: [] as Product[], listError: "", selectedId: "product-keyboard", detail: null as ProductDetail | null,
  photos: new Map<"pickup" | "return" | "returnExtra", string>(),
};

export function coreLoadingModal(): string {
  return `<div class="core-loading-backdrop"><section class="core-loading-dialog" role="dialog" aria-modal="true" aria-label="요청 처리 중" tabindex="-1"><span class="core-spinner" aria-hidden="true"></span><strong>${coreDemo.pending}</strong><small>잠시만 기다려 주세요</small></section></div>`;
}

function photoSlot(kind: "pickup" | "return" | "returnExtra", label: string): string {
  const photo = coreDemo.photos.get(kind);
  return `<label class="core-photo ${photo ? "uploaded" : ""}">
    <input type="file" accept="image/*" data-core-photo="${kind}" aria-label="${label} 업로드">
    ${photo ? `<img src="${photo}" alt="${label} 미리보기"><span>${label} 변경</span>` : `<span class="core-photo-icon" aria-hidden="true">▣</span><span>${label}</span>`}
  </label>`;
}

function productSkeleton(): string {
  return `<div class="core-skeleton" aria-label="제품 목록을 불러오는 중" role="status">
    <div class="core-skeleton-line wide"></div><div class="core-skeleton-chips"><i></i><i></i><i></i></div>
    <div class="core-skeleton-line medium"></div>
    ${Array.from({ length: 3 }, () => `<div class="core-skeleton-card"><i></i><span><b></b><b></b><b></b></span></div>`).join("")}
  </div>`;
}

const product = {
  title: "기계식 키보드 (저소음 적축)",
  distance: "0.4km · 6개월째 사용 중",
  deposit: 45_000,
  dailyFee: 2_000,
};

export function setCoreProduct(detail: ProductDetail): void {
  coreDemo.detail = detail;
  if (detail.track !== "RENTAL") return;
  product.title = detail.title;
  product.distance = `${(detail.distanceMeters / 1000).toFixed(1)}km · ${detail.neighborhoodName}`;
  product.deposit = detail.depositAmount;
  product.dailyFee = detail.dailyFeeAmount;
}

function productNavigation(): string {
  const items = [
    ["홈", "02", "m1-imgGroup1"],
    ["내 거래", "m2", "m1-imgGroup2"],
    ["채팅", "c1", "m1-imgIcon"],
    ["내 물건", "t6", "m1-imgGroup3"],
    ["마이", "m1", "m1-imgGroup4"],
  ] as const;
  return `<nav class="tabs" aria-label="주 메뉴">${items.map(([label, route, asset]) =>
    `<a href="#${route}" ${route === "02" ? 'aria-current="page"' : ""}><span>${icon(asset)}</span>${label}</a>`,
  ).join("")}</nav>`;
}

function productList(): string {
  const tabs = ["전체", "전자제품 대여", "미개봉 생활용품"].map((label) =>
    `<button class="core-tab ${coreDemo.tab === label ? "active" : ""}" type="button" data-core-tab="${label}" aria-pressed="${coreDemo.tab === label}">${label}</button>`,
  ).join("");
  const visible = coreDemo.products.filter(item => coreDemo.tab === "전체" ||
    (coreDemo.tab === "전자제품 대여" ? item.track === "RENTAL" : item.track === "SEALED_SALE"));
  const cards = visible.map(item => `<button class="core-product" type="button" data-product-id="${escapeHtml(item.productId)}">
    ${item.thumbnailUrl ? `<img class="core-thumb" src="${escapeHtml(item.thumbnailUrl)}" alt="${escapeHtml(item.title)}">` : placeholder("사진", "core-thumb")}
    <span>${tag(item.track === "RENTAL" ? "대여" : "미개봉", item.track === "RENTAL" ? "brand" : "neutral")}
    <strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.neighborhoodName)} · ${(item.distanceMeters / 1000).toFixed(1)}km</small>
    <b>${item.track === "RENTAL" ? `보증금 ${formatBudget(item.depositAmount)} · 하루 ${formatBudget(item.dailyFeeAmount)}` : formatBudget(item.salePriceAmount)}</b></span>
  </button>`).join("");
  const count = visible.length;
  return screen("김포시 사우동", `
    ${coreDemo.listLoading ? productSkeleton() : `
    <div class="core-budget-bar"><span>예산 ${formatBudget(budgetDemo.amount)} 안에서 보는 중</span>${link("변경", "01", "core-change")}</div>
    <div class="core-tabs" role="group" aria-label="제품 종류">${tabs}</div>
    <div class="core-list-heading"><h2>이웃이 쓰는 것 ${count}개</h2><small>아직 안 써 본 제품부터 보여 드려요</small></div>
    <div class="core-products">${coreDemo.listError ? `<div class="panel"><strong>제품을 불러오지 못했어요</strong><small>${escapeHtml(coreDemo.listError)}</small>${button("다시 시도", "core-retry-list")}</div>` : cards || `<div class="panel"><strong>예산 안의 제품이 없어요</strong><small>예산을 바꾸면 더 많은 제품을 볼 수 있어요.</small></div>`}</div>`}
  `, { className: "core-screen", footer: productNavigation() });
}

function requestScreen(): string {
  if (coreDemo.detail?.track === "SEALED_SALE") return screen("제품 상세", `<div class="core-product-detail">${tag("미개봉", "neutral")}<h2>${escapeHtml(coreDemo.detail.title)}</h2><p>${escapeHtml(coreDemo.detail.description)}</p><b>${formatBudget(coreDemo.detail.salePriceAmount)}</b></div>`, { back: "02", className: "core-screen", footer: footer(link("판매 요청 화면 보기", "t1")) });
  const usageFee = product.dailyFee * coreDemo.rentalDays;
  const total = product.deposit + usageFee;
  return screen("한번만 요청", `
    ${placeholder("제품 사진", "core-hero")}
    <div class="core-product-detail">${tag("대여", "brand")}<h2>${product.title}</h2><small>사용료 · ${product.distance}</small></div>
    <div class="core-quote">“${escapeHtml(coreDemo.detail?.description ?? "타건 소리가 조용한 편이에요. 밤에 써도 좋을 것 같아요.")}”</div>
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
    <div class="core-photo-pair"><div class="core-photo done">✓<span>걸어 둔 사진</span></div>${photoSlot("pickup", "가져간 사진 추가")}</div>
  `, { frame: "t1", back: "03", className: "core-screen", footer: footer(button("가져갔어요", "core-pickup")) });
}

function returnScreen(): string {
  return screen("반납하기", `
    <div class="core-list-heading"><h2>다시 문고리에 걸어 두고 사진을 남겨 주세요</h2><small>반납 사진은 다른 이웃을 위한 증거예요.</small></div>
    <div class="core-photo-pair">${photoSlot("return", "반납한 사진")}${photoSlot("returnExtra", "추가 사진 선택")}</div>
    <div class="core-trade-card">${placeholder("사진", "core-thumb")}<div><strong>${product.title}</strong><small>사용 기간 ${coreDemo.rentalDays}일</small><small>반납 기한 · 11월 16일 21:00</small></div></div>
    ${rows([["보증금", formatBudget(product.deposit)], ["결제될 사용료", formatBudget(product.dailyFee * coreDemo.rentalDays)]], "panel")}
    <div class="budget-notice"><span class="budget-info">i</span><p>주인이 반납을 확인하면 보증금 보류가 풀려요.</p></div>
  `, { frame: "t1", back: "04", className: "core-screen", footer: footer(button("반납 완료", "core-return")) });
}

function completeScreen(): string {
  return screen("반납 확인 완료", `
    <div class="core-complete"><span class="core-check">✓</span><h2>보증금 보류가 풀렸어요</h2><p>주인이 반납을 확인했어요.</p></div>
    ${rows([["보증금 보류 해제", formatBudget(product.deposit)], ["결제한 사용료", formatBudget(product.dailyFee * coreDemo.rentalDays)]], "panel")}
    <div class="core-experience"><h3>지금까지 처음 써 본 것 3개</h3><div>${tag("처음 써본 키보드", "neutral")}${tag("새로운 취향", "success")}</div><p>${coreDemo.reviewSubmitted ? `남긴 후기: ${escapeHtml(coreDemo.reviewText)}` : "한 줄 후기를 남겨 주세요."}</p></div>
    ${coreDemo.reviewOpen ? `<div class="scrim core-review-scrim" data-action="core-review-close"><section class="sheet core-review-sheet" role="dialog" aria-modal="true" aria-label="한 줄 후기 남기기"><div class="handle"></div><h2>한 줄 후기 남기기</h2><p>직접 써 본 경험을 이웃에게 알려 주세요.</p><textarea id="core-review-text" maxlength="140" placeholder="어땠는지 짧게 남겨 주세요">${escapeHtml(coreDemo.reviewText)}</textarea><small>최대 140자</small>${button("후기 저장", "core-review-save")}</section></div>` : ""}
  `, { className: "core-screen", footer: footer(`${button(coreDemo.reviewSubmitted ? "후기 수정하기" : "후기 남기기", "core-review")}${link("홈으로", "02", "core-home")}`) });
}

export const coreScreens: Record<CoreFrame, () => string> = {
  "02": productList,
  "03": requestScreen,
  "04": pickupScreen,
  "05": returnScreen,
  "06": completeScreen,
};
