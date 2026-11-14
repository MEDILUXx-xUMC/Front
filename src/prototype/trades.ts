import { button, checks, escapeHtml, footer, icon, link, notice, placeholder, rows, screen, sheet, tag } from "./ui";

export const tradeFrames = {
  t1: "미개봉 생활용품 상세", t2: "요청 확인", t3: "주인: 받은 요청", t4: "주인: 걸어 두기",
  t5: "주인: 반납 확인", t6: "내 물건 올리기", t7: "미개봉 생활용품 올리기", t8: "등록 불가 안내", t9: "거래 품목 기준",
} as const;

export type TradeFrame = keyof typeof tradeFrames;
export const keyboard = "기계식 키보드 (저소음 적축)";
export const detergent = "섬유유연제 코튼 블루 미니 (미개봉)";

export const tradeDemo = {
  requestChecks: [true, true],
  itemChecks: [true, true, false],
  photos: new Map<string, string>(),
  forms: {
    t6: { title: keyboard, depositAmount: "45000", dailyFeeAmount: "2000" },
    t7: { title: "섬유유연제 코튼 블루 미니", category: "섬유유연제", salePriceAmount: "1500" },
  },
  saleQuote: false,
  stage: "",
  policyBack: "t7",
};

function photo(key: string, text: string, camera: string, existing = false): string {
  const source = tradeDemo.photos.get(key);
  return `<label class="photo-slot ${source || existing ? "filled" : ""}">
    <input type="file" accept="image/*" data-photo="${key}" aria-label="${text}">
    ${source ? `<img class="photo-preview" src="${escapeHtml(source)}" alt="">` : icon(camera)}
    <span>${text}</span>
  </label>`;
}

function card(title: string, state: string, meta: string, amount: string): string {
  return `<div class="product-card">${placeholder("사진", "thumb")}<div>${tag(state)}<strong>${title}</strong><small>${meta}</small><b class="accent">${amount}</b></div></div>`;
}

const blockedItems = [
  ["덜어 담은 화장품 (샴푸·린스·바디워시·핸드워시)", "화장품법 제16조제2항"],
  ["덜어 담은 주방세제", "위생용품 관리법"],
  ["덜어 담은 섬유탈취제", "화학제품안전법"],
  ["덜어 담은 섬유유연제·세탁세제", "개인 간 소분 허용 여부 확인 중"],
] as const;

function policyItems(items: ReadonlyArray<readonly [string, string]>, badges = false): string {
  return `<ul class="policy-items">${items.map(([title, note], i) => `<li><div><strong>${title}</strong>${note && `<small>${note}</small>`}</div>${badges ? tag(i === 3 ? "확인 전 불가" : "금지", i === 3 ? "neutral" : "brand") : ""}</li>`).join("")}</ul>`;
}

function field(label: string, name: string, value: string, numeric = false): string {
  return `<label class="field">${label}<input name="${name}" value="${escapeHtml(value)}" required ${numeric ? 'inputmode="numeric" pattern="[0-9]+" autocomplete="off"' : ""}></label>`;
}

export const tradeScreens: Record<TradeFrame, () => string> = {
  t1: () => screen("미개봉 생활용품", `
    ${placeholder("제품 사진", "hero")}<div class="product-title">${tag("미개봉", "neutral")}<h2>${detergent}</h2><small>사우동 · 0.6km · 미개봉 정품</small></div>
    <blockquote class="panel">"향이 은은하게 오래가요. 여행용 미니 정품을 뜯지 않은 채로 드려요."</blockquote>
    ${rows([["가격", "1,500원"], ["상태", "미개봉 정품 · 표시사항 인쇄"], ["받는 방법", "문고리 거래"]])}
    ${notice("생활용품은 뜯지 않은 정품만 거래할 수 있어요. 덜어 담은 제품, 견본품, 사용한 칫솔·면도기·수건은 거래할 수 없어요.", "t1-imgGroup1")}
  `, { frame: "t1", back: "frames", footer: footer(button("1,500원에 써 보기", "sale-quote")) }),
  t2: () => {
    const sale = tradeDemo.saleQuote;
    const confirm = sale ? ["미개봉 상품을 문고리에서 가져갈게요", "가져간 뒤 사진을 남길게요"] : ["문고리에서 가져간 뒤 사진을 남길게요", "11월 16일까지 다시 문고리에 걸어 둘게요"];
    const quote: [string, string][] = sale ? [["결제 금액", "1,500원"]] : [["지금 결제 보류", "45,000원"], ["반납 확인 후 결제", "사용료 4,000원"]];
    return screen("한번만 요청", `
      ${placeholder("제품 사진", "hero tall")}<div class="skeleton" aria-hidden="true"><i></i><i></i><i></i></div>
      ${sheet(sale ? "결제 금액을 확인해 주세요" : "결제 보류를 확인해 주세요", `
        ${rows([...quote, ["결제 카드", "등록한 카드 •••• 5678"]], "panel")}
        ${checks(confirm, tradeDemo.requestChecks, "t2-imgGroup1")}
        ${button("요청 보내기", "send-request", "primary", !tradeDemo.requestChecks.every(Boolean))}
        ${link("취소", sale ? "t1" : "frames", "secondary")}
      `)}
    `, { frame: "t2", back: sale ? "t1" : "frames" });
  },
  t3: () => screen("받은 요청", `
    ${card(keyboard, "요청 옴", "내가 올린 제품", "하루 2,000원")}
    <div class="intro"><h2>풍무동 이웃이 이틀 동안 써 보고 싶어 해요</h2><p>이웃에게는 처음 써 보는 종류의 제품이에요.</p></div>
    ${rows([["사용 기간", "11월 14일부터 2일"], ["반납 기한", "11월 16일 21:00"], ["받을 사용료", "4,000원"], ["이웃의 보증금", "45,000원 보류됨"]], "panel")}
    ${notice("수락하면 오늘 안에 문고리에 걸어 두고 사진을 남겨 주세요. 사용료에서 수수료를 뺀 금액이 정산돼요.", "t3-imgGroup1")}
  `, { frame: "t3", back: "frames", footer: footer(button("수락하기", "accept") + button("거절하기", "reject", "secondary")) }),
  t4: () => screen("걸어 두기", `
    <div class="intro"><h2>문고리에 걸고 사진을 남겨 주세요</h2><p>제품 전체가 보이게 찍어 주세요. 반납 때 상태를 비교하는 기준이 돼요.</p></div>
    <div class="two">${photo("handoff", "걸어 둔 모습", "t4-imgGroup1")}${photo("condition", "제품 상태", "t4-imgGroup1")}</div>
    <ol class="steps">
      <li><span class="step done">${icon("t4-imgGroup2")}</span><div>요청 수락<small>풍무동 이웃 · 2일 사용</small></div></li>
      <li aria-current="step"><span class="step current">${icon("t4-imgIndicator")}</span><div>문고리에 걸어 두기<small>사진 두 장을 올리면 이웃에게 알림이 가요</small></div></li>
      <li><span class="step"></span><div>이웃이 가져감<small>가져간 사진이 올라오면 알려 드려요</small></div></li>
    </ol>
  `, { frame: "t4", back: "t3", footer: footer(button("걸어 뒀어요", "ready", "primary", !tradeDemo.photos.has("handoff") || !tradeDemo.photos.has("condition"))) }),
  t5: () => screen("반납 확인", `
    <div class="intro"><h2>반납된 상태를 확인해 주세요</h2><p>처음 걸어 둔 사진과 반납 사진을 비교해 보세요.</p></div>
    <div class="two">${["처음 걸어 둔 사진", "반납한 사진"].map((label, i) => {
      const source = tradeDemo.photos.get(i === 0 ? "handoff" : "return");
      return `<div class="photo-slot filled">${source ? `<img class="photo-preview" src="${escapeHtml(source)}" alt="">` : icon("t5-imgGroup1")}<span>${label}</span></div>`;
    }).join("")}</div>
    ${rows([["반납 시각", "11월 16일 18:40"], ["받을 사용료", "4,000원"]], "panel")}
    ${notice("확인을 누르면 이웃의 보증금 보류가 풀리고 사용료가 정산돼요. 파손이나 분실은 신고하면 해제가 보류돼요.", "t5-imgGroup2")}
  `, { frame: "t5", back: "t4", footer: footer(button("문제없이 반납됐어요", "complete") + button("파손·분실 신고", "dispute", "secondary")) }),
  t6: () => screen("내 물건 올리기", `
    <div class="two">${photo("rental-cover", "대표 사진", "t6-imgGroup1", true)}${photo("rental-extra", "사진 추가", "t6-imgGroup2")}</div>
    <div class="tracks">
      <div class="track selected">${icon("t6-imgRadio")}<div>전자제품 대여<small>써 보고 반납해요. 정가만큼 보증금이 걸려요.</small></div></div>
      <a class="track" href="#t7">${icon("t6-imgRadio1")}<div>미개봉 생활용품<small>뜯지 않은 정품만 팔아요. 덜어서 팔 수 없어요.</small></div></a>
    </div>
    <form id="listing" data-form="t6">${field("제품 이름", "title", tradeDemo.forms.t6.title)}<div class="two">${field("정가 (보증금)", "depositAmount", tradeDemo.forms.t6.depositAmount, true)}${field("하루 사용료", "dailyFeeAmount", tradeDemo.forms.t6.dailyFeeAmount, true)}</div></form>
  `, { frame: "t6", back: "frames", footer: footer('<button class="button primary" type="submit" form="listing">올리기</button>') }),
  t7: () => screen("내 물건 올리기", `
    <div class="bar panel"><strong>미개봉 생활용품</strong><a class="accent" href="#t6">트랙 변경</a></div>
    <div class="two">${photo("sale-cover", "대표 사진", "t7-imgGroup1", true)}${photo("sale-label", "표시사항 사진", "t7-imgGroup1", true)}</div>
    <form id="listing" data-form="t7">${field("제품 이름", "title", tradeDemo.forms.t7.title)}
      <div class="two"><label class="field"><span id="category-label">종류</span><select name="category" aria-labelledby="category-label">${["섬유유연제", "샴푸", "샴푸 (덜어서 팔기)"].map((item) => `<option ${item === tradeDemo.forms.t7.category ? "selected" : ""}>${item}</option>`).join("")}</select></label>${field("가격", "salePriceAmount", tradeDemo.forms.t7.salePriceAmount, true)}</div>
      ${checks(["포장을 뜯거나 덜어 담지 않았어요", "제품명과 표시사항이 포장에 인쇄돼 있어요", "견본품·사은품·비매품이 아니에요"], tradeDemo.itemChecks, "t7-imgGroup2")}
    </form>
    <button class="inline-link" type="button" data-action="policy-from-form">거래 품목 기준 보기 ${icon("t7-imgGroup3")}</button>
  `, { frame: "t7", back: "t6", footer: footer(`<button class="button primary" type="submit" form="listing" ${tradeDemo.itemChecks.every(Boolean) ? "" : "disabled"}>올리기</button>`) }),
  t8: () => screen("내 물건 올리기", `
    <label class="field">종류<input value="샴푸 (덜어서 팔기)" readonly></label><div class="skeleton" aria-hidden="true"><i></i><i></i><i></i></div>
    ${sheet("덜어 담은 샴푸는 올릴 수 없어요", `
      <p class="muted">화장품을 나누어 담아 파는 것은 화장품법으로 금지돼 있어요. 뜯지 않은 여행용·소용량 정품은 올릴 수 있어요.</p>
      <div class="panel">${policyItems(blockedItems, true)}</div>
      ${button("미개봉 정품으로 올리기", "sealed-category")}
      ${button("거래 품목 기준 보기", "policy-from-block", "secondary")}
    `, icon("t8-imgGroup1"))}
  `, { frame: "t8", back: "t7" }),
  t9: () => screen("거래 품목 기준", `
    <section class="policy panel"><h2>${tag("가능", "success")} 거래할 수 있어요</h2>${policyItems([["뜯지 않은 생활용품 정품", "개별 포장에 제품명과 표시사항이 인쇄된 것"], ["KC 표시가 있는 전자제품", "대여 트랙, 보증금 보류"]])}</section>
    <section class="policy panel"><h2>${tag("금지")} 덜어서 팔 수 없어요</h2>${policyItems(blockedItems.slice(0, 3).map(([title, note]) => [title.replace("덜어 담은 ", ""), note]))}</section>
    <section class="policy panel"><h2>${tag("확인 중", "neutral")} 확인 전까지 덜어서 팔 수 없어요</h2>${policyItems([["섬유유연제·세탁세제", "소분 지침이 개인 간 판매도 허용하는지 확인 중"]])}</section>
    <section class="policy panel"><h2>${tag("금지")} 거래할 수 없어요</h2>${policyItems([["견본품·사은품·비매품, 사용한 칫솔·면도기·수건", ""]])}</section>
  `, { frame: "t9", back: tradeDemo.policyBack, footer: footer(link("확인했어요", tradeDemo.policyBack)) }),
};
