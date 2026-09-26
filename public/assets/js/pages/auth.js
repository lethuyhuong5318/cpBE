import { api, session } from "../api.js";
import { el, icon, toast } from "../dom.js";
import { store } from "../store.js";

const BACKDROP = [237, 1025, 1080, 1062, 1012, 40, 1002, 1016, 1060, 1043, 1039, 1070, 1018, 1015];

function field({ label, name, type = "text", placeholder, autocomplete, required = true, min }) {
  const id = `f-${name}`;
  return el(
    "div",
    { class: "field" },
    el("label", { for: id }, label),
    el("input", { id, name, type, placeholder, autocomplete, required, min, class: "input" }),
  );
}

export function authPage(mode) {
  return async (app) => {
    const isLogin = mode === "login";
    const error = el("p", { class: "form-error", role: "alert", hidden: true });
    const submit = el("button", { class: "btn btn-primary btn-block", type: "submit" }, isLogin ? "Đăng nhập" : "Đăng ký");

    const form = el(
      "form",
      { class: "auth-form", novalidate: false },
      field({ label: "Email", name: "email", type: "email", placeholder: "Email", autocomplete: "email" }),
      field({
        label: "Mật khẩu",
        name: "mat_khau",
        type: "password",
        placeholder: isLogin ? "Mật khẩu" : "Tạo mật khẩu",
        autocomplete: isLogin ? "current-password" : "new-password",
      }),
      !isLogin && field({ label: "Họ tên", name: "ho_ten", placeholder: "Họ tên", autocomplete: "name" }),
      !isLogin && field({ label: "Tuổi", name: "tuoi", type: "number", placeholder: "Tuổi", required: false, min: 1 }),
      error,
      submit,
    );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      error.hidden = true;
      submit.disabled = true;
      const data = Object.fromEntries(new FormData(form));
      if (data.tuoi === "") delete data.tuoi;
      try {
        if (!isLogin) {
          await api.register(data);
          toast("Đăng ký thành công");
        }
        let tokens;
        try {
          tokens = await api.login({ email: data.email, mat_khau: data.mat_khau });
        } catch (loginError) {
          if (!isLogin) {
            location.hash = "#/login";
            return;
          }
          throw loginError;
        }
        session.save(tokens);
        await store.loadMe(true);
        location.hash = "#/";
      } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
        submit.disabled = false;
      }
    });

    app.replaceChildren(
      el(
        "div",
        { class: "auth-page" },
        el(
          "div",
          { class: "auth-backdrop", "aria-hidden": "true" },
          [...BACKDROP, ...BACKDROP.slice().reverse()].map((id) => el("img", { src: `https://picsum.photos/id/${id}/300/${380 + (id % 5) * 60}`, alt: "" })),
        ),
        el(
          "div",
          { class: "auth-modal", role: "dialog", "aria-labelledby": "auth-title" },
          el("a", { href: "#/login", class: "auth-close icon-btn", "aria-label": "Đóng" }, icon("close", 22)),
          el("div", { class: "logo logo-lg", "aria-hidden": "true" }, "M"),
          el("h1", { id: "auth-title" }, "Welcome to my picture"),
          !isLogin && el("p", { class: "auth-subtitle" }, "Tìm những ý tưởng mới để thử"),
          form,
          el(
            "p",
            { class: "auth-switch" },
            isLogin ? "Chưa có tài khoản? " : "Đã là thành viên? ",
            el("a", { href: isLogin ? "#/register" : "#/login" }, isLogin ? "Đăng ký" : "Đăng nhập"),
          ),
          isLogin && el("p", { class: "auth-hint" }, "Tài khoản mẫu: sang@gmail.com / 123456"),
        ),
      ),
    );
    form.querySelector("input").focus();
  };
}
