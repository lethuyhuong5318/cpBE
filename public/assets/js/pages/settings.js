import { api } from "../api.js";
import { avatar, el, toast } from "../dom.js";
import { store } from "../store.js";

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/);
  const ten = parts.pop() || "";
  return { ho: parts.join(" "), ten };
};

function field(label, input, hint) {
  return el("div", { class: "field" }, el("label", { for: input.id }, label), input, hint && el("small", { class: "field-hint" }, hint));
}

export async function settingsPage(app) {
  const me = await store.loadMe(true);
  let avatarFile = null;
  let objectUrl = null;

  const inputs = {
    ten: el("input", { id: "s-ten", class: "input", required: true, maxlength: 100 }),
    ho: el("input", { id: "s-ho", class: "input", maxlength: 150 }),
    tuoi: el("input", { id: "s-tuoi", class: "input", type: "number", min: 1, max: 120 }),
    gioi_thieu: el("textarea", { id: "s-gioi-thieu", class: "input", rows: 3, maxlength: 1000, placeholder: "Kể câu chuyện của bạn" }),
    trang_web: el("input", { id: "s-web", class: "input", type: "url", placeholder: "Thêm liên kết để hướng lưu lượng vào website" }),
    ten_nguoi_dung: el("input", { id: "s-username", class: "input", maxlength: 30, pattern: "[a-zA-Z0-9_.]{3,30}" }),
  };

  const avatarHolder = el("div");
  const fileInput = el("input", { type: "file", accept: "image/jpeg,image/png,image/gif,image/webp", hidden: true });

  const resetBtn = el("button", { class: "btn btn-secondary", type: "button" }, "Thiết lập lại");
  const saveBtn = el("button", { class: "btn btn-primary", type: "submit" }, "Lưu");

  const fill = (user) => {
    const { ho, ten } = splitName(user.ho_ten);
    inputs.ten.value = ten;
    inputs.ho.value = ho;
    inputs.tuoi.value = user.tuoi ?? "";
    inputs.gioi_thieu.value = user.gioi_thieu ?? "";
    inputs.trang_web.value = user.trang_web ?? "";
    inputs.ten_nguoi_dung.value = user.ten_nguoi_dung ?? "";
    avatarFile = null;
    fileInput.value = "";
    avatarHolder.replaceChildren(avatar(user, 80));
    setDirty(false);
  };

  const setDirty = (dirty) => {
    saveBtn.disabled = !dirty;
    resetBtn.disabled = !dirty;
  };

  fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) return toast("Ảnh phải nhỏ hơn 20MB", "error");
    avatarFile = f;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(f);
    avatarHolder.replaceChildren(avatar({ ho_ten: me.ho_ten, anh_dai_dien: objectUrl }, 80));
    setDirty(true);
  });

  const form = el(
    "form",
    { class: "settings-form" },
    el("h1", {}, "Hồ sơ công khai"),
    el("p", { class: "settings-subtitle" }, "Người truy cập hồ sơ của bạn sẽ thấy thông tin sau"),
    el(
      "div",
      { class: "field" },
      el("span", { class: "field-label" }, "Ảnh"),
      el(
        "div",
        { class: "avatar-row" },
        avatarHolder,
        el("button", { class: "btn btn-secondary", type: "button", onClick: () => fileInput.click() }, "Thay đổi"),
        fileInput,
      ),
    ),
    el("div", { class: "field-row" }, field("Tên", inputs.ten), field("Họ", inputs.ho)),
    field("Tuổi", inputs.tuoi),
    field("Giới thiệu", inputs.gioi_thieu),
    field("Trang web", inputs.trang_web),
    field("Tên người dùng", inputs.ten_nguoi_dung, "Chữ không dấu, số, dấu _ và dấu . (3-30 ký tự)"),
    el("div", { class: "settings-bar" }, resetBtn, saveBtn),
  );

  form.addEventListener("input", () => setDirty(true));
  resetBtn.addEventListener("click", () => fill(store.me));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const hoTen = `${inputs.ho.value.trim()} ${inputs.ten.value.trim()}`.trim();
    const fields = {
      ho_ten: hoTen,
      tuoi: inputs.tuoi.value,
      gioi_thieu: inputs.gioi_thieu.value,
      trang_web: inputs.trang_web.value.trim(),
      ten_nguoi_dung: inputs.ten_nguoi_dung.value.trim(),
    };

    saveBtn.disabled = true;
    try {
      let updated;
      if (avatarFile) {
        const data = new FormData();
        data.append("anh_dai_dien", avatarFile);
        Object.entries(fields).forEach(([k, v]) => data.append(k, v));
        updated = await api.updateMe({ form: data });
      } else {
        updated = await api.updateMe({ body: { ...fields, tuoi: fields.tuoi === "" ? null : Number(fields.tuoi) } });
      }
      store.setMe(updated);
      fill(store.me);
      document.dispatchEvent(new CustomEvent("me-updated"));
      toast("Đã lưu thông tin");
    } catch (error) {
      toast(error.message, "error");
      saveBtn.disabled = false;
    }
  });

  const oldPw = el("input", { id: "s-old-pw", class: "input", type: "password", autocomplete: "current-password", required: true });
  const newPw = el("input", { id: "s-new-pw", class: "input", type: "password", autocomplete: "new-password", minlength: 6, required: true });
  const pwForm = el(
    "form",
    { class: "settings-form password-form" },
    el("h2", {}, "Đổi mật khẩu"),
    el("div", { class: "field-row" }, field("Mật khẩu hiện tại", oldPw), field("Mật khẩu mới", newPw, "Ít nhất 6 ký tự")),
    el("button", { class: "btn btn-dark", type: "submit" }, "Đổi mật khẩu"),
  );
  pwForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api.changePassword({ mat_khau_cu: oldPw.value, mat_khau_moi: newPw.value });
      pwForm.reset();
      toast("Đã đổi mật khẩu");
    } catch (error) {
      toast(error.message, "error");
    }
  });

  app.replaceChildren(el("div", { class: "page settings-page" }, form, pwForm));
  fill(me);
  return () => objectUrl && URL.revokeObjectURL(objectUrl);
}
