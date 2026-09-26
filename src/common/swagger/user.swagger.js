import {
  formDataBody,
  jsonBody,
  pageParams,
  pathParam,
  responses,
} from "./swagger.helper.js";

export const user = {
  "/user/info": {
    get: {
      tags: ["User"],
      summary: "Trang quản lý ảnh: thông tin user (lấy từ token)",
      responses: responses(),
    },
    put: {
      tags: ["User"],
      summary: "Trang chỉnh sửa thông tin cá nhân (json hoặc form-data kèm file anh_dai_dien)",
      requestBody: {
        content: {
          ...jsonBody({
            ho_ten: { type: "string", example: "Sang Nguyễn" },
            tuoi: { type: "integer", example: 23 },
            ten_nguoi_dung: { type: "string", example: "sangnguyen" },
            gioi_thieu: { type: "string", example: "Kể câu chuyện của bạn" },
            trang_web: { type: "string", example: "https://example.com" },
            anh_dai_dien: { type: "string", example: "https://i.pravatar.cc/150" },
          }).content,
          ...formDataBody({
            anh_dai_dien: { type: "string", format: "binary" },
            ho_ten: { type: "string" },
            tuoi: { type: "integer" },
            ten_nguoi_dung: { type: "string" },
            gioi_thieu: { type: "string" },
            trang_web: { type: "string" },
          }).content,
        },
      },
      responses: responses({ 409: { description: "Tên người dùng đã tồn tại" } }),
    },
  },
  "/user/change-password": {
    put: {
      tags: ["User"],
      summary: "Mở rộng: đổi mật khẩu",
      requestBody: jsonBody(
        {
          mat_khau_cu: { type: "string", example: "123456" },
          mat_khau_moi: { type: "string", example: "654321" },
        },
        ["mat_khau_cu", "mat_khau_moi"],
      ),
      responses: responses(),
    },
  },
  "/user/saved-image": {
    get: {
      tags: ["User"],
      summary: "Trang quản lý ảnh: danh sách ảnh đã lưu (user lấy từ token)",
      parameters: pageParams,
      responses: responses(),
    },
  },
  "/user/created-image": {
    get: {
      tags: ["User"],
      summary: "Trang quản lý ảnh: danh sách ảnh đã tạo (user lấy từ token)",
      parameters: pageParams,
      responses: responses(),
    },
  },
  "/user/{userID}": {
    get: {
      tags: ["User"],
      summary: "Mở rộng: thông tin trang cá nhân của user theo id",
      parameters: [pathParam("userID")],
      responses: responses(),
    },
  },
  "/user/{userID}/saved-image": {
    get: {
      tags: ["User"],
      summary: "Danh sách ảnh đã lưu theo user id",
      parameters: [pathParam("userID"), ...pageParams],
      responses: responses(),
    },
  },
  "/user/{userID}/created-image": {
    get: {
      tags: ["User"],
      summary: "Danh sách ảnh đã tạo theo user id",
      parameters: [pathParam("userID"), ...pageParams],
      responses: responses(),
    },
  },
};
