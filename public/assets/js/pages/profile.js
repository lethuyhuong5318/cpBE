import { api } from "../api.js";
import { imageGrid } from "../components/imageGrid.js";
import { avatar, copyText, el, emptyState, icon, spinner } from "../dom.js";
import { store } from "../store.js";

export async function profilePage(app, { params, query }) {
  const me = store.me;
  const userId = params[0] ? Number(params[0]) : null;
  const isMe = !userId || userId === me?.nguoi_dung_id;

  app.replaceChildren(el("div", { class: "page" }, spinner()));

  let user;
  try {
    user = isMe ? await store.loadMe(true) : await api.getUser(userId);
  } catch (error) {
    app.replaceChildren(el("div", { class: "page" }, emptyState(error.message)));
    return;
  }

  const ownerParam = isMe ? null : userId;
  let activeTab = query.get("tab") === "created" ? "created" : "saved";
  let currentGrid = null;
  const gridHolder = el("div");

  const tabs = {
    created: el("button", { class: "tab", type: "button", role: "tab" }, "Đã tạo"),
    saved: el("button", { class: "tab", type: "button", role: "tab" }, "Đã lưu"),
  };

  const showTab = (tab) => {
    activeTab = tab;
    Object.entries(tabs).forEach(([key, btn]) => {
      btn.classList.toggle("tab-active", key === tab);
      btn.setAttribute("aria-selected", String(key === tab));
    });
    currentGrid?.destroy();
    currentGrid =
      tab === "created"
        ? imageGrid({
            loadPage: (page) => api.getCreatedImages(ownerParam, page),
            emptyText: isMe ? "Bạn chưa tạo ảnh nào" : "Người dùng chưa tạo ảnh nào",
            onDelete: isMe ? (image) => api.deleteImage(image.hinh_id) : undefined,
          })
        : imageGrid({
            loadPage: (page) => api.getSavedImages(ownerParam, page),
            emptyText: isMe ? "Bạn chưa lưu ảnh nào" : "Người dùng chưa lưu ảnh nào",
          });
    gridHolder.replaceChildren(currentGrid.node);
  };
  tabs.created.addEventListener("click", () => showTab("created"));
  tabs.saved.addEventListener("click", () => showTab("saved"));

  const website =
    user.trang_web &&
    el("a", { class: "profile-web", href: user.trang_web, target: "_blank", rel: "noopener noreferrer" }, user.trang_web.replace(/^https?:\/\//, ""));

  app.replaceChildren(
    el(
      "div",
      { class: "page page-wide profile-page" },
      el(
        "section",
        { class: "profile-head" },
        avatar(user, 120),
        el("h1", {}, user.ho_ten),
        user.ten_nguoi_dung && el("p", { class: "profile-username" }, `@${user.ten_nguoi_dung}`),
        user.gioi_thieu && el("p", { class: "profile-bio" }, user.gioi_thieu),
        website,
        el("p", { class: "profile-stats" }, `${user.so_anh_da_tao} ảnh đã tạo · ${user.so_anh_da_luu} ảnh đã lưu`),
        el(
          "div",
          { class: "profile-actions" },
          el(
            "button",
            {
              class: "btn btn-secondary",
              type: "button",
              onClick: () => copyText(`${location.origin}/#/profile/${user.nguoi_dung_id}`),
            },
            "Chia sẻ",
          ),
          isMe && el("a", { class: "btn btn-secondary", href: "#/settings" }, "Chỉnh sửa hồ sơ"),
        ),
      ),
      el(
        "div",
        { class: "tabs-row" },
        el("div", { class: "tabs", role: "tablist" }, tabs.created, tabs.saved),
        isMe && el("a", { class: "icon-btn add-btn", href: "#/create", "aria-label": "Tạo ảnh mới", title: "Tạo ảnh mới" }, icon("plus", 22)),
      ),
      gridHolder,
    ),
  );

  showTab(activeTab);
  return () => currentGrid?.destroy();
}
