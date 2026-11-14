import { formatWon } from "../utils/format";
import { detergent, keyboard, tradeDemo } from "./trades";
import { escapeHtml, footer, icon, link, placeholder, rows, screen, sheet, tag } from "./ui";

export const communityFrames = {
  m1: "마이", m2: "내 거래", m3: "처음 써 본 것", c1: "채팅 목록", c2: "채팅방",
} as const;

export type CommunityFrame = keyof typeof communityFrames;

const rooms = [
  { name: "타건소리", meta: "사우동 · 19:21", last: "케이블은 상자 안에 넣어 뒀어요", role: "borrowed", title: keyboard },
  { name: "향기수집가", meta: "사우동 · 어제", last: "내일 저녁에 가져갈게요", role: "lent", title: detergent },
  { name: "말랑마우스", meta: "풍무동 · 11월 12일", last: "반납 확인했어요. 감사합니다", role: "borrowed", title: "무선 마우스" },
  { name: "여행가방", meta: "풍무동 · 11월 10일", last: "거래가 끝나 주소가 가려졌어요", role: "lent", title: "여행용 가방" },
] as const;

type Message = { text: string; photo?: string };
export const communityDemo = {
  tradeFilter: "borrowed",
  chatFilter: "all",
  roomIndex: 0,
  read: new Set<number>(),
  messages: new Map<number, Message[]>(),
  modal: "",
  returnDate: "",
  selectedCategory: "",
};

export function appendMessage(message: Message): void {
  const messages = communityDemo.messages.get(communityDemo.roomIndex) ?? [];
  communityDemo.messages.set(communityDemo.roomIndex, [...messages, message]);
}

const categories = ["섬유유연제", "샴푸", "기계식 키보드", "바디워시", "세탁세제", "핸드워시", "무선 마우스", "무선 청소기", "섬유탈취제", "노트북 거치대", "블루투스 스피커", "고체 비누"];

function tabs(frame: "m1" | "m2"): string {
  const labels = ["홈", "내 거래", "채팅", "내 물건", "마이"];
  const targets = ["frames", "m2", "c1", "t6", "m1"];
  const assets = frame === "m1" ? ["imgGroup1", "imgGroup2", "imgIcon", "imgGroup3", "imgGroup4"] : ["imgGroup", "imgGroup1", "imgIcon", "imgGroup2", "imgGroup3"];
  return `<nav class="tabs" aria-label="주 메뉴">${labels.map((label, i) => `<a href="#${targets[i]}" ${targets[i] === frame ? 'aria-current="page"' : ""}><span>${icon(`${frame}-${assets[i]}`)}</span>${label}</a>`).join("")}</nav>`;
}

function filters(items: [string, string][], active: string, action: string): string {
  return `<div class="filters">${items.map(([value, label]) => `<button class="pill" aria-pressed="${value === active}" type="button" data-community="${action}" data-value="${value}">${label}</button>`).join("")}</div>`;
}

function profileRow(label: string, value: string, target: string): string {
  const body = `<span>${label}</span><span class="muted">${value}${icon("m1-imgGroup")}</span>`;
  return target === "m2" ? `<a href="#m2">${body}</a>` : `<button type="button" data-community="modal" data-value="${target}">${body}</button>`;
}

function tradeCard(title: string, label: string, meta: string, amount: string, route: string, done = false): string {
  const chatLink = route === "c2" ? 'data-community="room" data-value="0"' : "";
  return `<a class="product-card" href="#${route}" ${chatLink}>${placeholder("사진", "thumb")}<div>${tag(label, done ? "success" : "brand")}<strong>${title}</strong><small>${meta}</small><b class="accent">${amount}</b></div></a>`;
}

function dialog(title: string, content: string): string {
  return sheet(title, content + `<button class="button secondary" type="button" data-community="close">닫기</button>`);
}

function profileDialog(): string {
  switch (communityDemo.modal) {
    case "card": return dialog("결제수단", rows([["등록한 카드", "•••• 5678"]], "panel"));
    case "account": return dialog("정산 계좌", "<p>등록된 정산 계좌가 없어요.</p>");
    case "rules": return dialog("문고리 거래 수칙", "<p>수락된 거래의 상대에게만 주소가 공개돼요. 물건을 걸어 둔 뒤 상태 사진을 남겨 주세요.</p>");
    case "support": return dialog("고객센터", "<p>이 화면에서는 거래 신고와 문의 흐름을 확인할 수 있어요.</p>");
    default: return "";
  }
}

function chatDialog(): string {
  if (communityDemo.modal === "trade") {
    return dialog("거래 정보", rows([["제품", rooms[communityDemo.roomIndex]?.title ?? keyboard], ["상태", communityDemo.roomIndex === 0 ? "문고리에 걸림" : "거래 내역"], ["거래 구역", "사우동"]], "panel"));
  }
  if (communityDemo.modal === "schedule") {
    return dialog("반납 일정 정하기", `<form id="schedule-form"><label class="field">반납 날짜<input type="date" name="date" required value="${escapeHtml(communityDemo.returnDate)}"></label><button class="button primary" type="submit">저장</button></form>`);
  }
  return "";
}

function chatMessages(): string {
  const room = rooms[communityDemo.roomIndex] ?? rooms[0];
  const initial = communityDemo.roomIndex === 0 ? `
    <div class="system-message">11월 14일 토요일</div>
    <div class="system-message">요청이 수락됐어요. 주소는 거래 정보에서 볼 수 있어요</div>
    <div class="message"><span>안녕하세요! 오늘 저녁 7시쯤<br>문고리에 걸어 둘게요</span><time>18:02</time></div>
    <div class="message own"><span>네 좋아요. 8시 전에 가져갈게요</span><time>18:05</time></div>
    <div class="system-message">주인이 걸어 둔 사진 2장을 올렸어요</div>
    <div class="message">${placeholder("걸어 둔 사진", "chat-photo")}<time>19:20</time></div>
    <div class="message"><span>${room.last}</span><time>19:21</time></div>
    <div class="system-message">계좌 이체나 다른 메신저로 거래를 유도하면<br>신고해 주세요</div>
  ` : `<div class="message"><span>${room.last}</span></div>`;
  const additions = communityDemo.messages.get(communityDemo.roomIndex) ?? [];
  return initial + additions.map((message) => `<div class="message own">${message.photo
    ? `<img class="chat-photo" src="${escapeHtml(message.photo)}" alt="${escapeHtml(message.text)}">`
    : `<span>${escapeHtml(message.text)}</span>`}</div>`).join("");
}

export const communityScreens: Record<CommunityFrame, () => string> = {
  m1: () => screen("마이", `
    <div class="profile">${icon("m1-imgAvatar")}<div><h2>김포시 사우동 · 반경 1km</h2>${tag("동네 인증됨", "success")}</div></div>
    <div class="profile-stats">${[["3종류", "처음 써 본 것"], ["5번", "빌려준 횟수"], ["18,000원", "받은 사용료"]].map(([value, label]) => `<div class="panel"><strong>${value}</strong><small>${label}</small></div>`).join("")}</div>
    <a class="profile-banner" href="#m3"><div><strong>아직 안 써 본 종류 9개</strong><small>우리 동네에서 써 볼 수 있는 것부터 보여 드려요</small></div><span class="accent">보기</span></a>
    <div class="profile-links">
      ${profileRow("내 거래 내역", "", "m2")}
      ${profileRow("결제수단", "•••• 5678", "card")}
      ${profileRow("정산 계좌", "", "account")}
      ${profileRow("문고리 거래 수칙", "", "rules")}
      ${profileRow("고객센터", "", "support")}
    </div>${profileDialog()}
  `, { footer: tabs("m1"), headerAction: `<div class="header-action notifications">
      <button class="icon-button notification-trigger" type="button" aria-label="알림" aria-expanded="false" aria-controls="notification-popover">${icon("m1-imgNotification")}</button>
      <section class="notification-popover" id="notification-popover" aria-labelledby="notification-title" hidden>
        <h2 id="notification-title">알림</h2><p>새 알림이 없어요.</p>
      </section>
    </div>` }),
  m2: () => {
    const stage = tradeDemo.stage;
    const lent = communityDemo.tradeFilter === "lent";
    const filtersMarkup = filters([["borrowed", "빌린 것"], ["lent", "빌려준 것"]], communityDemo.tradeFilter, "trade-filter");
    if (lent) {
      const resolved = ["COMPLETED", "REJECTED"].includes(stage);
      const state = { ACCEPTED: "수락됨", READY_FOR_PICKUP: "문고리에 걸림", DISPUTED: "신고 확인 중", COMPLETED: "완료", REJECTED: "거절됨" }[stage] ?? "받은 요청";
      const route = { ACCEPTED: "t4", READY_FOR_PICKUP: "t5", DISPUTED: "t5", COMPLETED: "t5" }[stage] ?? "t3";
      const item = tradeCard(keyboard, state, "풍무동 · 이틀 사용", "받을 사용료 4,000원", route, resolved);
      return screen("내 거래", `${filtersMarkup}<h3>진행 중 ${resolved ? 0 : 1}</h3>${resolved ? '<p class="muted">진행 중인 거래가 없어요.</p>' : item}<h3>완료 ${resolved ? 1 : 0}</h3>${resolved ? item : '<p class="muted">완료한 거래가 없어요.</p>'}`, { footer: tabs("m2") });
    }
    return screen("내 거래", `
      ${filtersMarkup}<h3>진행 중 2</h3>
      ${tradeCard(keyboard, "가져가기 전", "사우동 · 11월 16일까지 반납", "보증금 45,000원 보류 중", "c2")}
      ${tradeCard(detergent, "문고리에 걸림", "사우동 · 가져가면 거래 끝", "1,500원 결제 완료", "t1")}
      <h3>완료 1</h3>${tradeCard("허브 샴푸 여행용 (미개봉)", "완료", "풍무동 · 11월 10일", formatWon(1200).replace("₩", "") + "원", "m3", true)}
    `, { footer: tabs("m2") });
  },
  m3: () => screen("처음 써 본 것", `
    <div class="intro"><h2>지금까지 3종류를 처음 써 봤어요</h2><p>빈 칸은 아직 안 써 본 종류예요.<br>이웃 제품으로 채워 보세요.</p></div>
    <ul class="experience-grid">${categories.map((label, i) => `<li><button type="button" class="${i < 3 ? "experienced" : ""}" data-community="experience" data-value="${label}" aria-pressed="${communityDemo.selectedCategory === label}">${i < 3 ? icon("m3-imgGroup1") : ""}${label}</button></li>`).join("")}</ul>
  `, { frame: "m3", back: "m1", footer: footer(link("안 써 본 것 둘러보기", "t1")) }),
  c1: () => screen("채팅", `
    ${filters([["all", "전체"], ["borrowed", "빌린 거래"], ["lent", "빌려준 거래"]], communityDemo.chatFilter, "chat-filter")}
    <div class="chat-list">${rooms.map((room, i) => {
      if (communityDemo.chatFilter !== "all" && communityDemo.chatFilter !== room.role) return "";
      const last = communityDemo.messages.get(i)?.at(-1)?.text ?? room.last;
      return `<a href="#c2" data-community="room" data-value="${i}">${icon("c1-imgAvatar")}<div><strong>${room.name}</strong> <small>${room.meta}</small><p>${escapeHtml(last)}</p></div>${i === 0 && !communityDemo.read.has(i) ? '<span class="unread" aria-label="읽지 않은 메시지 2개">2</span>' : ""}${placeholder("", "chat-thumb")}</a>`;
    }).join("")}</div>
  `, { frame: "c1", back: "m2" }),
  c2: () => {
    const room = rooms[communityDemo.roomIndex] ?? rooms[0];
    return screen(room.name, `
      <div class="chat-context">${placeholder("", "chat-thumb")}<div><strong>${room.title}</strong><small>${communityDemo.roomIndex === 0 ? tag("문고리에 걸림") + " 보증금 45,000원 보류 중" : "거래 채팅"}</small></div>
      <button type="button" class="inline-link" data-community="modal" data-value="trade">거래 정보</button></div>
      <div class="messages" aria-label="메시지 목록">${chatMessages()}</div>
      ${chatDialog()}
    `, { frame: "c2", back: "c1", className: "chat-screen", footer: `<footer class="chat-footer">
      <div class="chat-quick"><label class="pill">가져갔어요 사진 올리기<input type="file" data-chat-photo accept="image/*"></label><button type="button" class="pill" data-community="modal" data-value="schedule">반납 일정 정하기</button></div>
      <form id="chat-form"><label class="round-button" aria-label="사진 첨부">${icon("c2-imgGroup1")}<input type="file" data-chat-photo accept="image/*" aria-label="사진 첨부"></label><input type="text" name="message" placeholder="메시지 보내기" aria-label="메시지 보내기" maxlength="500" required><button class="round-button primary" type="submit" aria-label="보내기">${icon("c2-imgGroup2")}</button></form>
    </footer>` });
  },
};
