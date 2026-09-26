import { avatar, el, icon } from "../dom.js";
import { store } from "../store.js";

let closeOpenMenu = null;
document.addEventListener("click", () => closeOpenMenu?.());

function dropdown(trigger, items, align = "left") {
  const menu = el(
    "div",
    { class: `dropdown-menu dropdown-${align}`, role: "menu", hidden: true },
    items.map(({ label, onClick }) =>
      el("button", { class: "dropdown-item", role: "menuitem", type: "button", onClick }, label),
    ),
  );
  const wrap = el("div", { class: "dropdown" }, trigger, menu);
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = menu.hidden;
    closeOpenMenu?.();
    if (willOpen) {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      closeOpenMenu = () => {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        closeOpenMenu = null;
      };
    }
  });
  return wrap;
}

export function renderHeader({ path, query }) {
  const container = document.getElementById("header");
  const me = store.me;

  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    placeholder: "Tìm kiếm",
    "aria-label": "Tìm kiếm ảnh theo tên",
    value: path === "/search" ? query.get("q") || "" : "",
  });

  const searchForm = el(
    "form",
    {
      class: "search-form",
      role: "search",
      onSubmit: (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        location.hash = q ? `#/search?q=${encodeURIComponent(q)}` : "#/";
      },
    },
    icon("search", 16),
    searchInput,
  );

  const createMenu = dropdown(
    el("button", { class: `nav-link ${path === "/create" ? "nav-link-active" : ""}`, type: "button" }, "Tạo", icon("chevron", 16)),
    [{ label: "Tạo Ghim", onClick: () => (location.hash = "#/create") }],
  );

  const userMenu = dropdown(
    el("button", { class: "icon-btn", type: "button", "aria-label": "Tài khoản và các tuỳ chọn khác" }, icon("chevron", 18)),
    [
      { label: "Trang cá nhân", onClick: () => (location.hash = "#/profile") },
      { label: "Chỉnh sửa hồ sơ", onClick: () => (location.hash = "#/settings") },
      {
        label: "Đăng xuất",
        onClick: () => {
          store.logout();
          location.hash = "#/login";
        },
      },
    ],
    "right",
  );

  container.replaceChildren(
    el(
      "header",
      { class: "site-header" },
      el("a", { href: "#/", class: "logo", "aria-label": "Trang chủ My Picture" }, "M"),
      el("a", { href: "#/", class: `nav-link ${path === "/" ? "nav-link-active" : ""}` }, "Trang chủ"),
      createMenu,
      searchForm,
      el(
        "div",
        { class: "header-actions" },
        el("button", { class: "icon-btn", type: "button", "aria-label": "Thông báo", title: "Thông báo" }, icon("bell", 22)),
        el("button", { class: "icon-btn", type: "button", "aria-label": "Tin nhắn", title: "Tin nhắn" }, icon("chat", 22)),
        el("a", { href: "#/profile", class: "icon-btn", "aria-label": "Trang cá nhân" }, avatar(me, 26)),
        userMenu,
      ),
    ),
  );
}

export function clearHeader() {
  document.getElementById("header").replaceChildren();
}
