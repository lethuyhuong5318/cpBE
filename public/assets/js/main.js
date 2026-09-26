import { session } from "./api.js";
import { clearHeader, renderHeader } from "./components/header.js";
import { el, emptyState, spinner } from "./dom.js";
import { store } from "./store.js";
import { authPage } from "./pages/auth.js";
import { createPage } from "./pages/create.js";
import { detailPage } from "./pages/detail.js";
import { homePage, searchPage } from "./pages/home.js";
import { profilePage } from "./pages/profile.js";
import { settingsPage } from "./pages/settings.js";

const routes = [
  { pattern: /^\/login$/, page: authPage("login"), public: true, title: "Đăng nhập" },
  { pattern: /^\/register$/, page: authPage("register"), public: true, title: "Đăng ký" },
  { pattern: /^\/$/, page: homePage, title: "Trang chủ" },
  { pattern: /^\/search$/, page: searchPage, title: "Tìm kiếm" },
  { pattern: /^\/image\/(\d+)$/, page: detailPage, title: "Chi tiết ảnh" },
  { pattern: /^\/profile(?:\/(\d+))?$/, page: profilePage, title: "Trang cá nhân" },
  { pattern: /^\/create$/, page: createPage, title: "Tạo Ghim" },
  { pattern: /^\/settings$/, page: settingsPage, title: "Chỉnh sửa hồ sơ" },
];

const app = document.getElementById("app");
let cleanup = null;
let renderId = 0;

const parseHash = () => {
  const hash = location.hash.slice(1) || "/";
  const [path, search = ""] = hash.split("?");
  return { path: path || "/", query: new URLSearchParams(search) };
};

async function render() {
  const current = ++renderId;
  const { path, query } = parseHash();
  const route = routes.find((r) => r.pattern.test(path));

  cleanup?.();
  cleanup = null;
  closeMenus();

  if (!route) {
    renderHeader({ path, query });
    app.replaceChildren(el("div", { class: "page" }, emptyState("Không tìm thấy trang")));
    return;
  }

  if (!route.public && !session.isLoggedIn()) {
    location.hash = "#/login";
    return;
  }
  if (route.public && session.isLoggedIn()) {
    location.hash = "#/";
    return;
  }

  document.title = `${route.title} · My Picture`;

  if (route.public) {
    clearHeader();
  } else {
    if (!store.me) {
      app.replaceChildren(el("div", { class: "page" }, spinner()));
      try {
        await store.loadMe();
      } catch {
        return;
      }
    }
    renderHeader({ path, query });
  }

  const params = path.match(route.pattern).slice(1);
  const result = await route.page(app, { params, query });
  if (current !== renderId) {
    result?.();
    return;
  }
  cleanup = typeof result === "function" ? result : null;
  window.scrollTo(0, 0);
}

function closeMenus() {
  document.body.click();
}

document.addEventListener("me-updated", () => {
  const { path, query } = parseHash();
  renderHeader({ path, query });
});

window.addEventListener("hashchange", render);
render();
