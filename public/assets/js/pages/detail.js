import { api } from "../api.js";
import { avatar, copyText, el, emptyState, hostname, icon, spinner, timeAgo, toast } from "../dom.js";
import { store } from "../store.js";

function saveButton(imageId, initialSaved) {
  let saved = initialSaved;
  const btn = el("button", { class: "btn", type: "button" });
  const render = () => {
    btn.className = `btn ${saved ? "btn-dark" : "btn-primary"}`;
    btn.textContent = saved ? "Đã lưu" : "Lưu";
    btn.setAttribute("aria-pressed", String(saved));
  };
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      const result = saved ? await api.unsaveImage(imageId) : await api.saveImage(imageId);
      saved = result.da_luu;
      toast(saved ? "Đã lưu vào hồ sơ của bạn" : "Đã bỏ lưu");
      render();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      btn.disabled = false;
    }
  });
  render();
  return btn;
}

function commentItem(comment, { canDelete, onDelete }) {
  const user = comment.nguoi_dung;
  return el(
    "li",
    { class: "comment" },
    el("a", { href: `#/profile/${user.nguoi_dung_id}` }, avatar(user, 32)),
    el(
      "div",
      { class: "comment-body" },
      el(
        "p",
        {},
        el("a", { href: `#/profile/${user.nguoi_dung_id}`, class: "comment-author" }, user.ho_ten),
        " ",
        comment.noi_dung,
      ),
      el(
        "div",
        { class: "comment-meta" },
        el("time", { datetime: comment.ngay_binh_luan, title: new Date(comment.ngay_binh_luan).toLocaleString("vi-VN") }, timeAgo(comment.ngay_binh_luan)),
        canDelete && el("button", { class: "link-btn", type: "button", onClick: onDelete }, "Xoá"),
      ),
    ),
  );
}

export async function detailPage(app, { params }) {
  const imageId = params[0];
  app.replaceChildren(el("div", { class: "page" }, spinner()));

  let image, saveStatus, comments;
  try {
    [image, saveStatus, comments] = await Promise.all([
      api.getImage(imageId),
      api.getSaveStatus(imageId),
      api.getComments(imageId),
    ]);
  } catch (error) {
    app.replaceChildren(el("div", { class: "page" }, emptyState(error.message)));
    return;
  }

  const me = store.me;
  const isOwner = me?.nguoi_dung_id === image.nguoi_dung_id;
  let commentCount = comments.totalItems;

  const countLabel = el("span");
  const list = el("ul", { class: "comment-list" });
  const renderCount = () => {
    countLabel.textContent = commentCount ? `${commentCount} nhận xét` : "Nhận xét";
  };
  const addComment = (comment, prepend = false) => {
    const canDelete = me?.nguoi_dung_id === comment.nguoi_dung_id || isOwner;
    const item = commentItem(comment, {
      canDelete,
      onDelete: async () => {
        if (!confirm("Xoá bình luận này?")) return;
        try {
          await api.deleteComment(comment.binh_luan_id);
          item.remove();
          commentCount -= 1;
          renderCount();
        } catch (error) {
          toast(error.message, "error");
        }
      },
    });
    prepend ? list.prepend(item) : list.append(item);
  };
  comments.items.forEach((c) => addComment(c));
  renderCount();

  const toggle = el(
    "button",
    { class: "comments-toggle", type: "button", "aria-expanded": "true" },
    countLabel,
    icon("chevron", 18),
  );
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    list.hidden = open;
  });

  const commentInput = el("input", {
    class: "comment-input",
    placeholder: "Thêm nhận xét",
    "aria-label": "Thêm nhận xét",
    maxlength: 1000,
  });
  const sendBtn = el("button", { class: "icon-btn send-btn", type: "submit", "aria-label": "Gửi nhận xét", disabled: true }, icon("send", 18));
  commentInput.addEventListener("input", () => (sendBtn.disabled = !commentInput.value.trim()));
  const commentForm = el("form", { class: "comment-form" }, avatar(me, 40), el("div", { class: "comment-field" }, commentInput, sendBtn));
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const noiDung = commentInput.value.trim();
    if (!noiDung) return;
    sendBtn.disabled = true;
    try {
      const comment = await api.addComment(imageId, noiDung);
      addComment(comment, true);
      commentCount += 1;
      renderCount();
      commentInput.value = "";
      list.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    } catch (error) {
      toast(error.message, "error");
      sendBtn.disabled = false;
    }
  });

  const creator = image.nguoi_dung;
  const img = el("img", { src: image.duong_dan, alt: image.ten_hinh });
  img.addEventListener("error", () => img.classList.add("img-broken"));

  app.replaceChildren(
    el(
      "div",
      { class: "page detail-page" },
      el("button", { class: "icon-btn back-btn", type: "button", "aria-label": "Quay lại", onClick: () => history.back() }, icon("back", 22)),
      el(
        "article",
        { class: "detail-card" },
        el("div", { class: "detail-media" }, img),
        el(
          "div",
          { class: "detail-info" },
          el(
            "div",
            { class: "detail-toolbar" },
            el(
              "div",
              { class: "toolbar-left" },
              el("button", { class: "icon-btn", type: "button", "aria-label": "Chia sẻ", title: "Chia sẻ", onClick: () => copyText(location.href) }, icon("share", 20)),
              image.lien_ket &&
                el("a", { class: "icon-btn", href: image.lien_ket, target: "_blank", rel: "noopener noreferrer", "aria-label": "Mở liên kết", title: "Mở liên kết" }, icon("link", 20)),
            ),
            saveButton(imageId, saveStatus.da_luu),
          ),
          image.lien_ket &&
            el("a", { class: "detail-source", href: image.lien_ket, target: "_blank", rel: "noopener noreferrer" }, hostname(image.lien_ket)),
          el("h1", { class: "detail-title" }, image.ten_hinh),
          image.mo_ta && el("p", { class: "detail-desc" }, image.mo_ta),
          el(
            "a",
            { class: "detail-creator", href: `#/profile/${creator.nguoi_dung_id}` },
            avatar(creator, 48),
            el(
              "div",
              {},
              el("strong", {}, creator.ho_ten),
              el("span", {}, `${image._count.luu_anh} lượt lưu`),
            ),
          ),
          el("div", { class: "detail-comments" }, toggle, list),
          commentForm,
        ),
      ),
    ),
  );
}
