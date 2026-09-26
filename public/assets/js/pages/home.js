import { api } from "../api.js";
import { imageGrid } from "../components/imageGrid.js";
import { el } from "../dom.js";

export async function homePage(app) {
  const grid = imageGrid({ loadPage: (page) => api.getImages(page) });
  app.replaceChildren(el("div", { class: "page page-wide" }, grid.node));
  return grid.destroy;
}

export async function searchPage(app, { query }) {
  const q = (query.get("q") || "").trim();
  if (!q) {
    location.hash = "#/";
    return;
  }
  const grid = imageGrid({
    loadPage: (page) => api.searchImages(q, page),
    emptyText: `Không tìm thấy ảnh nào cho "${q}"`,
  });
  app.replaceChildren(
    el(
      "div",
      { class: "page page-wide" },
      el("h1", { class: "search-title" }, "Kết quả cho ", el("strong", {}, `"${q}"`)),
      grid.node,
    ),
  );
  return grid.destroy;
}
