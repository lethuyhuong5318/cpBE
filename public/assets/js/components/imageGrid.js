import { avatar, el, emptyState, icon, spinner, toast } from "../dom.js";

export function imageCard(image, { onDelete } = {}) {
  const img = el("img", {
    src: image.duong_dan,
    alt: image.ten_hinh,
    loading: "lazy",
  });
  img.addEventListener("error", () => img.classList.add("img-broken"));

  const media = el("a", { href: `#/image/${image.hinh_id}`, class: "pin-media" }, img);

  if (onDelete) {
    media.append(
      el(
        "button",
        {
          class: "pin-delete",
          type: "button",
          title: "Xoá ảnh",
          "aria-label": `Xoá ảnh ${image.ten_hinh}`,
          onClick: (e) => {
            e.preventDefault();
            onDelete(image);
          },
        },
        icon("trash", 18),
      ),
    );
  }

  const creator = image.nguoi_dung;
  return el(
    "article",
    { class: "pin" },
    media,
    el("a", { href: `#/image/${image.hinh_id}`, class: "pin-title" }, image.ten_hinh),
    creator &&
      el(
        "a",
        { href: `#/profile/${creator.nguoi_dung_id}`, class: "pin-creator" },
        avatar(creator, 24),
        el("span", {}, creator.ho_ten),
      ),
  );
}

export function imageGrid({ loadPage, emptyText = "Chưa có ảnh nào", onDelete }) {
  const grid = el("div", { class: "masonry" });
  const status = el("div", { class: "grid-status" });
  const sentinel = el("div", { class: "grid-sentinel" });
  const node = el("section", { class: "grid-wrap" }, grid, status, sentinel);

  let page = 0;
  let totalPages = Infinity;
  let loading = false;

  const removeCard = async (image, card) => {
    if (!confirm(`Xoá ảnh "${image.ten_hinh}"?`)) return;
    try {
      await onDelete(image);
      card.remove();
      toast("Đã xoá ảnh");
      if (!grid.children.length) status.replaceChildren(emptyState(emptyText));
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const loadMore = async () => {
    if (loading || page >= totalPages) return;
    loading = true;
    status.replaceChildren(spinner());
    try {
      const data = await loadPage(page + 1);
      page = data.page;
      totalPages = data.totalPages;
      data.items.forEach((image) => {
        const card = imageCard(image, {
          onDelete: onDelete ? (img) => removeCard(img, card) : undefined,
        });
        grid.append(card);
      });
      status.replaceChildren(
        !grid.children.length ? emptyState(emptyText) : "",
      );
    } catch (error) {
      status.replaceChildren(
        el(
          "div",
          { class: "empty-state" },
          error.message,
          " ",
          el("button", { class: "btn btn-secondary", type: "button", onClick: loadMore }, "Thử lại"),
        ),
      );
      loading = false;
      return;
    }
    loading = false;
    if (sentinel.getBoundingClientRect().top < window.innerHeight + 400) loadMore();
  };

  const observer = new IntersectionObserver(
    (entries) => entries.some((e) => e.isIntersecting) && loadMore(),
    { rootMargin: "400px" },
  );
  observer.observe(sentinel);
  loadMore();

  return { node, destroy: () => observer.disconnect() };
}
