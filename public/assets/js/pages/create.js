import { api } from "../api.js";
import { avatar, el, icon, toast } from "../dom.js";
import { store } from "../store.js";

const MAX_SIZE = 20 * 1024 * 1024;

export async function createPage(app) {
  const me = store.me;
  let file = null;
  let objectUrl = null;

  const fileInput = el("input", { type: "file", accept: "image/jpeg,image/png,image/gif,image/webp", hidden: true });
  const preview = el("img", { class: "upload-preview", alt: "Ảnh xem trước", hidden: true });
  const dropText = el(
    "div",
    { class: "upload-placeholder" },
    icon("upload", 28),
    el("p", {}, "Kéo và thả hoặc nhấp vào để tải lên"),
  );
  const removeBtn = el("button", { class: "icon-btn upload-remove", type: "button", "aria-label": "Bỏ ảnh", hidden: true }, icon("close", 18));
  const dropzone = el(
    "div",
    { class: "dropzone", role: "button", tabindex: 0, "aria-label": "Chọn ảnh để tải lên" },
    dropText,
    preview,
    removeBtn,
  );

  const urlInput = el("input", { class: "input", type: "url", name: "duong_dan", placeholder: "Dán đường dẫn ảnh (https://...)", "aria-label": "Đường dẫn ảnh" });
  const urlBox = el("div", { class: "url-box", hidden: true }, urlInput);

  const setPreview = (src) => {
    preview.src = src || "";
    preview.hidden = !src;
    dropText.hidden = !!src;
    removeBtn.hidden = !src;
    dropzone.classList.toggle("has-image", !!src);
  };

  const setFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Chỉ chấp nhận file ảnh", "error");
    if (f.size > MAX_SIZE) return toast("Ảnh phải nhỏ hơn 20MB", "error");
    file = f;
    urlInput.value = "";
    urlBox.hidden = true;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(f);
    setPreview(objectUrl);
  };

  const clearImage = () => {
    file = null;
    fileInput.value = "";
    urlInput.value = "";
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    setPreview(null);
  };

  dropzone.addEventListener("click", (e) => {
    if (e.target.closest(".upload-remove")) return;
    fileInput.click();
  });
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragging");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragging");
    setFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", () => setFile(fileInput.files[0]));
  removeBtn.addEventListener("click", clearImage);
  urlInput.addEventListener("input", () => {
    file = null;
    const value = urlInput.value.trim();
    setPreview(/^https?:\/\/\S+$/i.test(value) ? value : null);
  });
  preview.addEventListener("error", () => {
    if (!file) toast("Không tải được ảnh từ đường dẫn này", "error");
  });

  const titleInput = el("input", { class: "title-input", name: "ten_hinh", placeholder: "Tạo tiêu đề", maxlength: 255, required: true, "aria-label": "Tiêu đề" });
  const descInput = el("textarea", { class: "line-input", name: "mo_ta", placeholder: "Cho mọi người biết Ghim của bạn giới thiệu điều gì", rows: 2, "aria-label": "Mô tả" });
  const linkInput = el("input", { class: "line-input", type: "url", name: "lien_ket", placeholder: "Thêm một liên kết đến", "aria-label": "Liên kết" });
  const submit = el("button", { class: "btn btn-primary", type: "submit" }, "Đăng");

  const form = el(
    "form",
    { class: "create-card" },
    el("div", { class: "create-top" }, el("span", { class: "icon-btn", "aria-hidden": "true" }, icon("more", 20)), submit),
    el(
      "div",
      { class: "create-body" },
      el(
        "div",
        { class: "create-left" },
        dropzone,
        fileInput,
        el("p", { class: "upload-hint" }, "Bạn nên sử dụng tập tin .jpg chất lượng cao có kích thước dưới 20MB"),
        urlBox,
        el(
          "button",
          {
            class: "btn btn-secondary btn-block",
            type: "button",
            onClick: () => {
              urlBox.hidden = !urlBox.hidden;
              if (!urlBox.hidden) urlInput.focus();
            },
          },
          "Lưu từ trang",
        ),
      ),
      el(
        "div",
        { class: "create-right" },
        titleInput,
        el("div", { class: "create-user" }, avatar(me, 40), el("strong", {}, me?.ho_ten)),
        descInput,
        el("div", { class: "spacer" }),
        linkInput,
      ),
    ),
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!file && !url) return toast("Vui lòng chọn ảnh hoặc dán đường dẫn ảnh", "error");
    if (!titleInput.value.trim()) {
      titleInput.focus();
      return toast("Vui lòng nhập tiêu đề", "error");
    }

    const data = new FormData();
    if (file) data.append("hinh_anh", file);
    else data.append("duong_dan", url);
    data.append("ten_hinh", titleInput.value.trim());
    data.append("mo_ta", descInput.value.trim());
    data.append("lien_ket", linkInput.value.trim());

    submit.disabled = true;
    submit.textContent = "Đang đăng...";
    try {
      const image = await api.createImage(data);
      toast("Đã tạo ảnh");
      location.hash = `#/image/${image.hinh_id}`;
    } catch (error) {
      toast(error.message, "error");
      submit.disabled = false;
      submit.textContent = "Đăng";
    }
  });

  app.replaceChildren(el("div", { class: "page create-page" }, form));
  return () => objectUrl && URL.revokeObjectURL(objectUrl);
}
