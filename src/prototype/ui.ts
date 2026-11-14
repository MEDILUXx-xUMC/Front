export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character] ?? character;
  });
}

export function icon(name: string): string {
  return `<img class="icon" src="${import.meta.env.BASE_URL}figma/${name}.svg" alt="">`;
}

export function link(label: string, route: string, variant = "primary"): string {
  return `<a class="button ${variant}" href="#${route}">${label}</a>`;
}

export function button(label: string, action: string, variant = "primary", disabled = false): string {
  return `<button type="button" class="button ${variant}" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}

export function rows(items: ReadonlyArray<readonly [string, string]>, className = ""): string {
  return `<dl class="rows ${className}">${items.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
}

export function notice(text: string, asset: string): string {
  return `<aside class="notice panel">${icon(asset)}<span>${text}</span></aside>`;
}

export function tag(label: string, tone = "brand"): string {
  return `<span class="tag ${tone}">${label}</span>`;
}

export function checks(labels: string[], checked: boolean[], asset: string): string {
  return `<div class="checks">${labels.map((label, index) => `<label class="check"><input type="checkbox" data-check="${index}" ${checked[index] ? "checked" : ""}><span class="check-mark">${icon(asset)}</span><span>${label}</span></label>`).join("")}</div>`;
}

export function screen(title: string, body: string, options: { back?: string; frame?: string; footer?: string; headerAction?: string; className?: string } = {}): string {
  const back = options.back && options.frame
    ? `<a class="back" href="#${options.back}" aria-label="뒤로">${icon(`${options.frame}-imgGroup`)}</a>`
    : "";
  return `<section class="screen ${options.className ?? ""}">
    <div class="status" aria-hidden="true">9:41</div>
    <header class="appbar">${back}<h1>${title}</h1>${options.headerAction ?? ""}</header>
    <main class="body" id="screen-content">${body}</main>
    ${options.footer ?? ""}
  </section>`;
}

export function footer(content: string): string {
  return `<footer class="footer">${content}</footer>`;
}

export function sheet(title: string, content: string, leading = ""): string {
  return `<div class="scrim"><section class="sheet" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="handle"></div><h2>${leading}${title}</h2>${content}
  </section></div>`;
}

export function placeholder(label: string, className = ""): string {
  return `<div class="placeholder ${className}">${label}</div>`;
}
