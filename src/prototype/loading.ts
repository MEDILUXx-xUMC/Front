type Shape = "line" | "short" | "button" | "hero" | "square" | "avatar" | "input" | "chip" | "tile" | "photo";

function block(shape: Shape = "line"): string {
  return `<span class="loading-block loading-${shape}"></span>`;
}

function group(content: string, className = ""): string {
  return `<div class="loading-group ${className}">${content}</div>`;
}

function repeat(count: number, content: string): string {
  return content.repeat(count);
}

const title = block("short");
const text = block();
const button = block("button");
const intro = group(title + text + block("short"));
const chips = (count: number) => group(repeat(count, block("chip")), "loading-row");
const photos = group(repeat(2, block("photo")), "loading-grid");
const fields = group(repeat(2, block("input")), "loading-grid");
const avatarRow = group(block("avatar") + group(title + text, "loading-grow"), "loading-row");
const card = group(block("square") + group(block("chip") + text + title, "loading-grow"), "loading-row loading-card");
const details = (count: number) => group(repeat(count, group(title + title, "loading-between")));
const tabs = group(repeat(5, block("chip")), "loading-tabs");
const sheet = (content: string) => group(block("chip") + title + content, "loading-sheet");

interface Layout {
  body: string;
  footer?: string;
  sheet?: string;
}

const layouts: Record<string, Layout> = {
  t1: { body: block("hero") + group(block("chip") + title + text) + block("input") + details(3) + block("tile"), footer: button },
  t2: { body: block("hero") + intro, sheet: sheet(details(3) + text + text + button + button) },
  t3: { body: card + intro + details(4) + block("tile"), footer: button + button },
  t4: { body: intro + photos + group(repeat(3, avatarRow)), footer: button },
  t5: { body: intro + photos + details(2) + block("tile"), footer: button + button },
  t6: { body: photos + block("tile") + block("tile") + title + block("input") + fields, footer: button },
  t7: { body: block("input") + photos + title + block("input") + fields + group(repeat(3, text)) + title, footer: button },
  t8: { body: title + block("input") + intro, sheet: sheet(text + text + group(repeat(4, group(title + text, "loading-policy"))) + button + button) },
  t9: { body: group(repeat(4, group(title + text + text, "loading-policy"))), footer: button },
  m1: { body: avatarRow + group(repeat(3, block("tile")), "loading-grid triple") + block("tile") + details(5), footer: tabs },
  m2: { body: chips(2) + title + card + card + title + card, footer: tabs },
  m3: { body: intro + group(repeat(12, block("tile")), "loading-grid triple"), footer: button },
  c1: { body: chips(3) + group(repeat(4, group(block("avatar") + group(title + text, "loading-grow") + block("square"), "loading-row loading-chat-row"))), },
  c2: {
    body: group(block("square") + group(text + title, "loading-grow") + block("chip"), "loading-row loading-chat-row")
      + group(block("chip") + block("short") + block("short") + block("photo") + block("short"), "loading-messages"),
    footer: chips(2) + group(block("avatar") + block("input") + block("avatar"), "loading-composer"),
  },
};

export function loadingScreen(frame: string, title: string): string {
  const layout = layouts[frame];
  if (!layout) return "";
  return `<section class="screen route-loading" data-loading-frame="${frame}" aria-busy="true" aria-label="${title} 불러오는 중">
    <span class="loading-status" role="status">${title} 불러오는 중</span>
    <div class="loading-layout" aria-hidden="true">
      <div class="status">9:41</div>
      <header class="appbar">${block("short")}</header>
      <div class="body">${layout.body}</div>
      ${layout.footer ? `<div class="footer">${layout.footer}</div>` : ""}
      ${layout.sheet ? `<div class="loading-scrim">${layout.sheet}</div>` : ""}
    </div>
  </section>`;
}
