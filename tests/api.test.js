import { test, before } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3069/api";

const call = async (method, path, { token, body, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(BASE_URL + path, { method, headers, body: payload });
  const json = await res.json();
  return { status: res.status, body: json };
};

const login = async (email) => {
  const res = await call("POST", "/auth/login", {
    body: { email, mat_khau: "123456" },
  });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  return res.body.data;
};

const pngBlob = () =>
  new Blob(
    [
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    ],
    { type: "image/png" },
  );

let tokenSang;
let tokenPhong;
const uniqueEmail = `test${Date.now()}@gmail.com`;

before(async () => {
  tokenSang = (await login("sang@gmail.com")).accessToken;
  tokenPhong = (await login("phong@gmail.com")).accessToken;
});

test("POST /auth/register: đăng ký thành công, không trả mật khẩu", async () => {
  const res = await call("POST", "/auth/register", {
    body: { email: uniqueEmail, mat_khau: "123456", ho_ten: "Test User", tuoi: 20 },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.email, uniqueEmail);
  assert.equal(res.body.data.mat_khau, undefined);
});

test("POST /auth/register: trùng email -> 409, thiếu dữ liệu -> 400", async () => {
  const dup = await call("POST", "/auth/register", {
    body: { email: uniqueEmail, mat_khau: "123456", ho_ten: "Test" },
  });
  assert.equal(dup.status, 409);
  const bad = await call("POST", "/auth/register", {
    body: { email: "abc", mat_khau: "1", ho_ten: "" },
  });
  assert.equal(bad.status, 400);
});

test("POST /auth/login: sai mật khẩu -> 400, body sai JSON -> 400", async () => {
  const res = await call("POST", "/auth/login", {
    body: { email: "sang@gmail.com", mat_khau: "sai" },
  });
  assert.equal(res.status, 400);
  const broken = await call("POST", "/auth/login", { body: "{abc" });
  assert.equal(broken.status, 400);
});

test("POST /auth/refresh-token: trả accessToken mới", async () => {
  const tokens = await login("nhu@gmail.com");
  const res = await call("POST", "/auth/refresh-token", { body: tokens });
  assert.equal(res.status, 200);
  assert.ok(res.body.data.accessToken);
});

test("JWT: không có token -> 401, token sai -> 401", async () => {
  assert.equal((await call("GET", "/image")).status, 401);
  assert.equal((await call("GET", "/image", { token: "abc.def.ghi" })).status, 401);
});

test("GET /image: danh sách ảnh có phân trang + người tạo", async () => {
  const res = await call("GET", "/image?page=1&pageSize=5", { token: tokenSang });
  assert.equal(res.status, 200);
  const { items, totalItems, pageSize } = res.body.data;
  assert.equal(pageSize, 5);
  assert.ok(items.length <= 5 && totalItems >= 12);
  assert.ok(items[0].nguoi_dung.ho_ten);
  assert.equal(items[0].nguoi_dung.email, undefined);
});

test("GET /image/search: tìm theo tên (không phân biệt hoa thường)", async () => {
  const res = await call("GET", `/image/search?ten_hinh=${encodeURIComponent("CHÓ")}`, {
    token: tokenSang,
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.data.items.length >= 2);
  res.body.data.items.forEach((i) => assert.match(i.ten_hinh.toLowerCase(), /chó/));
  assert.equal((await call("GET", "/image/search", { token: tokenSang })).status, 400);
});

test("GET /image/:id: thông tin ảnh + người tạo, id sai -> 400/404", async () => {
  const res = await call("GET", "/image/8", { token: tokenSang });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.ten_hinh, "digsy");
  assert.equal(res.body.data.nguoi_dung.nguoi_dung_id, 3);
  assert.ok(res.body.data._count.binh_luan >= 2);
  assert.equal((await call("GET", "/image/abc", { token: tokenSang })).status, 400);
  assert.equal((await call("GET", "/image/99999", { token: tokenSang })).status, 404);
});

test("GET + POST /image/:id/comment: bình luận lấy user từ token", async () => {
  const created = await call("POST", "/image/8/comment", {
    token: tokenPhong,
    body: { noi_dung: "Test bình luận", nguoi_dung_id: 1 },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.nguoi_dung_id, 2);

  const list = await call("GET", "/image/8/comment", { token: tokenSang });
  assert.equal(list.status, 200);
  assert.equal(list.body.data.items[0].noi_dung, "Test bình luận");

  const empty = await call("POST", "/image/8/comment", { token: tokenPhong, body: { noi_dung: "  " } });
  assert.equal(empty.status, 400);

  const commentId = created.body.data.binh_luan_id;
  assert.equal((await call("DELETE", `/comment/${commentId}`, { token: tokenSang })).status, 403);
  assert.equal((await call("DELETE", `/comment/${commentId}`, { token: tokenPhong })).status, 200);
  assert.equal((await call("DELETE", `/comment/${commentId}`, { token: tokenPhong })).status, 404);
});

test("GET/POST/DELETE /image/:id/save: kiểm tra, lưu, bỏ lưu", async () => {
  const check = async () => (await call("GET", "/image/12/save", { token: tokenPhong })).body.data.da_luu;
  assert.equal(await check(), false);
  assert.equal((await call("POST", "/image/12/save", { token: tokenPhong })).status, 200);
  assert.equal(await check(), true);
  assert.equal((await call("DELETE", "/image/12/save", { token: tokenPhong })).status, 200);
  assert.equal(await check(), false);
  assert.equal((await call("DELETE", "/image/12/save", { token: tokenPhong })).status, 404);
});

test("GET /user/info: thông tin user từ token, không có mật khẩu", async () => {
  const res = await call("GET", "/user/info", { token: tokenSang });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.email, "sang@gmail.com");
  assert.equal(res.body.data.mat_khau, undefined);
  assert.ok(res.body.data.so_anh_da_tao >= 1);
});

test("GET /user/saved-image + /user/:id/saved-image", async () => {
  const mine = await call("GET", "/user/saved-image", { token: tokenSang });
  assert.equal(mine.status, 200);
  assert.ok(mine.body.data.items.length >= 3);
  assert.ok(mine.body.data.items[0].ngay_luu);
  const byId = await call("GET", "/user/1/saved-image", { token: tokenPhong });
  assert.equal(byId.body.data.totalItems, mine.body.data.totalItems);
});

test("GET /user/created-image + /user/:id/created-image + /user/:id", async () => {
  const mine = await call("GET", "/user/created-image", { token: tokenSang });
  assert.equal(mine.status, 200);
  mine.body.data.items.forEach((i) => assert.equal(i.nguoi_dung_id, 1));
  const byId = await call("GET", "/user/3/created-image", { token: tokenSang });
  byId.body.data.items.forEach((i) => assert.equal(i.nguoi_dung_id, 3));
  const profile = await call("GET", "/user/3", { token: tokenSang });
  assert.equal(profile.status, 200);
  assert.equal(profile.body.data.email, undefined);
  assert.equal((await call("GET", "/user/9999", { token: tokenSang })).status, 404);
});

test("POST /image: thêm ảnh bằng upload file, sửa, xoá (soft delete)", async () => {
  const form = new FormData();
  form.append("hinh_anh", pngBlob(), "test.png");
  form.append("ten_hinh", "Ảnh test upload");
  form.append("mo_ta", "Mô tả");
  const created = await call("POST", "/image", { token: tokenPhong, form });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.match(created.body.data.duong_dan, /^\/images\/local-.*\.png$/);
  const id = created.body.data.hinh_id;

  const file = await fetch(BASE_URL.replace(/\/api$/, "") + created.body.data.duong_dan);
  assert.equal(file.status, 200);

  assert.equal((await call("PUT", `/image/${id}`, { token: tokenSang, body: { ten_hinh: "x" } })).status, 403);
  assert.equal((await call("DELETE", `/image/${id}`, { token: tokenSang })).status, 403);

  const updated = await call("PUT", `/image/${id}`, { token: tokenPhong, body: { ten_hinh: "Tên mới" } });
  assert.equal(updated.body.data.ten_hinh, "Tên mới");

  assert.equal((await call("DELETE", `/image/${id}`, { token: tokenPhong })).status, 200);
  assert.equal((await call("GET", `/image/${id}`, { token: tokenPhong })).status, 404);
});

test("POST /image: thêm ảnh bằng link, validate dữ liệu", async () => {
  const created = await call("POST", "/image", {
    token: tokenPhong,
    body: { ten_hinh: "Ảnh từ link", duong_dan: "https://picsum.photos/id/1018/600/800" },
  });
  assert.equal(created.status, 201);
  await call("DELETE", `/image/${created.body.data.hinh_id}`, { token: tokenPhong });

  assert.equal((await call("POST", "/image", { token: tokenPhong, body: { ten_hinh: "x" } })).status, 400);
  assert.equal(
    (await call("POST", "/image", { token: tokenPhong, body: { ten_hinh: "x", duong_dan: "abc" } })).status,
    400,
  );

  const form = new FormData();
  form.append("hinh_anh", new Blob(["hello"], { type: "text/plain" }), "a.txt");
  form.append("ten_hinh", "file sai");
  assert.equal((await call("POST", "/image", { token: tokenPhong, form })).status, 400);
});

test("PUT /user/info: cập nhật thông tin, validate, trùng tên người dùng", async () => {
  const res = await call("PUT", "/user/info", {
    token: tokenPhong,
    body: { ho_ten: "Phong Từ Lâm", tuoi: 26, gioi_thieu: "Xin chào", trang_web: "https://phong.dev" },
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.tuoi, 26);
  assert.equal(res.body.data.mat_khau, undefined);

  assert.equal((await call("PUT", "/user/info", { token: tokenPhong, body: { tuoi: "abc" } })).status, 400);
  assert.equal((await call("PUT", "/user/info", { token: tokenPhong, body: {} })).status, 400);
  const dup = await call("PUT", "/user/info", { token: tokenPhong, body: { ten_nguoi_dung: "sangnguyen" } });
  assert.equal(dup.status, 409);
});

test("PUT /user/info: upload ảnh đại diện (form-data)", async () => {
  const form = new FormData();
  form.append("anh_dai_dien", pngBlob(), "avatar.png");
  const res = await call("PUT", "/user/info", { token: tokenPhong, form });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.match(res.body.data.anh_dai_dien, /^\/images\//);
  await call("PUT", "/user/info", {
    token: tokenPhong,
    body: { anh_dai_dien: "https://i.pravatar.cc/150?img=33" },
  });
});

test("PUT /user/change-password: sai mật khẩu cũ -> 400, đúng -> 200", async () => {
  const wrong = await call("PUT", "/user/change-password", {
    token: tokenPhong,
    body: { mat_khau_cu: "sai", mat_khau_moi: "123456" },
  });
  assert.equal(wrong.status, 400);
  const ok = await call("PUT", "/user/change-password", {
    token: tokenPhong,
    body: { mat_khau_cu: "123456", mat_khau_moi: "123456" },
  });
  assert.equal(ok.status, 200);
});

test("Route không tồn tại -> 404", async () => {
  assert.equal((await call("GET", "/khong-ton-tai", { token: tokenSang })).status, 404);
});
