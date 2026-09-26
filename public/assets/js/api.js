const API_URL = "/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  },
};

export const session = {
  get accessToken() {
    return storage.get("accessToken");
  },
  get refreshToken() {
    return storage.get("refreshToken");
  },
  isLoggedIn() {
    return !!storage.get("accessToken");
  },
  save({ accessToken, refreshToken }) {
    storage.set("accessToken", accessToken);
    if (refreshToken) storage.set("refreshToken", refreshToken);
  },
  clear() {
    storage.remove("accessToken");
    storage.remove("refreshToken");
  },
};

let refreshing = null;
const refreshAccessToken = async () => {
  refreshing ??= fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const json = await res.json();
      session.save(json.data);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

const onUnauthorized = () => {
  session.clear();
  if (!location.hash.startsWith("#/login")) {
    location.hash = "#/login";
  }
};

export async function request(path, { method = "GET", body, form, retry = true } = {}) {
  const headers = {};
  const token = session.accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: payload });
  } catch {
    throw new ApiError("Không kết nối được máy chủ", 0);
  }

  let json;
  try {
    json = await res.json();
  } catch {
    json = { message: "Máy chủ trả về dữ liệu không hợp lệ" };
  }

  if (res.status === 403 && json.message === "jwt expired" && retry && token) {
    if (await refreshAccessToken()) {
      return request(path, { method, body, form, retry: false });
    }
    onUnauthorized();
  }

  if (res.status === 401 && token) {
    onUnauthorized();
  }

  if (!res.ok) {
    throw new ApiError(json.message || "Có lỗi xảy ra", res.status);
  }

  return json.data;
}

const qs = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const str = search.toString();
  return str ? `?${str}` : "";
};

export const api = {
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  login: (data) => request("/auth/login", { method: "POST", body: data }),

  getImages: (page, pageSize = 20) => request(`/image${qs({ page, pageSize })}`),
  searchImages: (ten_hinh, page, pageSize = 20) =>
    request(`/image/search${qs({ ten_hinh, page, pageSize })}`),
  getImage: (id) => request(`/image/${id}`),
  getComments: (id, page = 1, pageSize = 50) =>
    request(`/image/${id}/comment${qs({ page, pageSize })}`),
  addComment: (id, noi_dung) =>
    request(`/image/${id}/comment`, { method: "POST", body: { noi_dung } }),
  deleteComment: (commentId) => request(`/comment/${commentId}`, { method: "DELETE" }),
  getSaveStatus: (id) => request(`/image/${id}/save`),
  saveImage: (id) => request(`/image/${id}/save`, { method: "POST" }),
  unsaveImage: (id) => request(`/image/${id}/save`, { method: "DELETE" }),
  createImage: (form) => request("/image", { method: "POST", form }),
  deleteImage: (id) => request(`/image/${id}`, { method: "DELETE" }),

  getMe: () => request("/user/info"),
  getUser: (id) => request(`/user/${id}`),
  getSavedImages: (userId, page, pageSize = 20) =>
    request(`/user/${userId ? `${userId}/` : ""}saved-image${qs({ page, pageSize })}`),
  getCreatedImages: (userId, page, pageSize = 20) =>
    request(`/user/${userId ? `${userId}/` : ""}created-image${qs({ page, pageSize })}`),
  updateMe: ({ body, form }) => request("/user/info", { method: "PUT", body, form }),
  changePassword: (data) => request("/user/change-password", { method: "PUT", body: data }),
};
