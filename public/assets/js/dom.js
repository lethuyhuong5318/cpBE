export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (["value", "checked", "disabled", "hidden", "selected"].includes(key)) {
      node[key] = value;
    } else node.setAttribute(key, value === true ? "" : value);
  }
  append(node, children);
  return node;
}

export function append(node, children) {
  for (const child of [children].flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

const ICONS = {
  search:
    '<path d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.4-1.41 1.4-5.4-5.39A8 8 0 1 1 10 2m0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12"/>',
  bell:
    '<path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22m7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/>',
  chat:
    '<path d="M12 2C6.5 2 2 6.03 2 11c0 2.48 1.12 4.72 2.93 6.35L4 22l4.9-2.46c.97.3 2 .46 3.1.46 5.5 0 10-4.03 10-9S17.5 2 12 2M7 12.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>',
  chevron: '<path d="M12 16.5 4.5 9l1.4-1.4 6.1 6.1 6.1-6.1L19.5 9z"/>',
  back: '<path d="M8.4 13 15.7 20.3l-1.4 1.4L4.6 12l9.7-9.7 1.4 1.4L8.4 11H21v2z"/>',
  more: '<path d="M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0m8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0"/>',
  share:
    '<path d="M12 2 6.3 7.7l1.4 1.4L11 5.8V15h2V5.8l3.3 3.3 1.4-1.4zM4 13v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7h-2v7H6v-7z"/>',
  link:
    '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0m-2.1 3.5-1.4 1.4a2.5 2.5 0 0 1-3.5-3.5l3.5-3.5a2.5 2.5 0 0 1 3.5 0l1.4-1.4a4.5 4.5 0 0 0-6.3 0L2.2 13.4a4.5 4.5 0 0 0 6.3 6.3l1.4-1.4zm7-9.9-1.4 1.4a2.5 2.5 0 0 1 3.5 3.5l-3.5 3.5a2.5 2.5 0 0 1-3.5 0l-1.4 1.4a4.5 4.5 0 0 0 6.3 0l3.5-3.5a4.5 4.5 0 0 0-6.3-6.3z"/>',
  upload:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 15h-2v-6.2l-2.3 2.3-1.4-1.4L12 7l4.7 4.7-1.4 1.4-2.3-2.3z"/>',
  trash:
    '<path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zm-2 3h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/>',
  close:
    '<path d="m13.4 12 6.3-6.3-1.4-1.4-6.3 6.3-6.3-6.3-1.4 1.4 6.3 6.3-6.3 6.3 1.4 1.4 6.3-6.3 6.3 6.3 1.4-1.4z"/>',
  send: '<path d="M2 21 23 12 2 3v7l15 2-15 2z"/>',
  plus: '<path d="M13 3h-2v8H3v2h8v8h2v-8h8v-2h-8z"/>',
};

export function icon(name, size = 20) {
  const span = el("span", { class: "icon", "aria-hidden": "true" });
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor">${ICONS[name] || ""}</svg>`;
  return span;
}

export function avatar(user, size = 32) {
  const letter = (user?.ho_ten || user?.email || "?").trim().charAt(0).toUpperCase();
  const fallback = el("span", { class: "avatar-letter" }, letter);
  const wrap = el("span", {
    class: "avatar",
    style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.42)}px` },
    title: user?.ho_ten || "",
  });
  if (user?.anh_dai_dien) {
    const img = el("img", { src: user.anh_dai_dien, alt: "", loading: "lazy" });
    img.addEventListener("error", () => img.replaceWith(fallback));
    wrap.append(img);
  } else {
    wrap.append(fallback);
  }
  return wrap;
}

export function toast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const node = el("div", { class: `toast toast-${type}`, role: "status" }, message);
  container.append(node);
  setTimeout(() => node.classList.add("toast-hide"), 2800);
  setTimeout(() => node.remove(), 3200);
}

export function spinner() {
  return el("div", { class: "spinner", role: "status", "aria-label": "Đang tải" });
}

export function emptyState(text) {
  return el("div", { class: "empty-state" }, text);
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    [31536000, "năm"],
    [2592000, "tháng"],
    [604800, "tuần"],
    [86400, "ngày"],
    [3600, "giờ"],
    [60, "phút"],
  ];
  for (const [unit, label] of units) {
    if (seconds >= unit) return `${Math.floor(seconds / unit)} ${label} trước`;
  }
  return "Vừa xong";
}

export function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Đã sao chép liên kết");
  } catch {
    toast("Không sao chép được liên kết", "error");
  }
}
