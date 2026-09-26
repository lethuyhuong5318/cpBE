import {
  formDataBody,
  jsonBody,
  pageParams,
  pathParam,
  queryParam,
  responses,
} from "./swagger.helper.js";

const imageFormProperties = {
  hinh_anh: { type: "string", format: "binary", description: "File ảnh (tối đa 20MB)" },
  duong_dan: { type: "string", description: "Hoặc link ảnh có sẵn (nếu không upload file)" },
  ten_hinh: { type: "string", example: "Chó đeo kính râm" },
  mo_ta: { type: "string", example: "Mô tả ảnh" },
  lien_ket: { type: "string", example: "https://threadless.com" },
};

export const image = {
  "/image": {
    get: {
      tags: ["Image"],
      summary: "Trang chủ: lấy danh sách ảnh",
      parameters: [
        ...pageParams,
        queryParam("filters", "string", '{"ten_hinh":"chó"}'),
      ],
      responses: responses(),
    },
    post: {
      tags: ["Image"],
      summary: "Trang thêm ảnh: thêm một ảnh của user (user lấy từ token)",
      requestBody: formDataBody(imageFormProperties, ["ten_hinh"]),
      responses: responses({ 201: { description: "Thêm ảnh thành công" } }),
    },
  },
  "/image/search": {
    get: {
      tags: ["Image"],
      summary: "Trang chủ: tìm kiếm danh sách ảnh theo tên",
      parameters: [queryParam("ten_hinh", "string", "chó"), ...pageParams],
      responses: responses(),
    },
  },
  "/image/{imageID}": {
    get: {
      tags: ["Image"],
      summary: "Trang chi tiết: thông tin ảnh và người tạo ảnh",
      parameters: [pathParam("imageID")],
      responses: responses(),
    },
    put: {
      tags: ["Image"],
      summary: "Mở rộng: sửa ảnh (chỉ người tạo)",
      parameters: [pathParam("imageID")],
      requestBody: formDataBody(imageFormProperties),
      responses: responses(),
    },
    delete: {
      tags: ["Image"],
      summary: "Trang quản lý ảnh: xoá ảnh đã tạo (chỉ người tạo)",
      parameters: [pathParam("imageID")],
      responses: responses(),
    },
  },
  "/image/{imageID}/comment": {
    get: {
      tags: ["Image"],
      summary: "Trang chi tiết: danh sách bình luận theo id ảnh",
      parameters: [pathParam("imageID", 8), ...pageParams],
      responses: responses(),
    },
    post: {
      tags: ["Image"],
      summary: "Trang chi tiết: bình luận ảnh (user lấy từ token)",
      parameters: [pathParam("imageID", 8)],
      requestBody: jsonBody(
        { noi_dung: { type: "string", example: "Ảnh đẹp quá!" } },
        ["noi_dung"],
      ),
      responses: responses({ 201: { description: "Bình luận thành công" } }),
    },
  },
  "/image/{imageID}/save": {
    get: {
      tags: ["Image"],
      summary: "Trang chi tiết: kiểm tra đã lưu ảnh này chưa (nút Lưu / Đã lưu)",
      parameters: [pathParam("imageID", 3)],
      responses: responses(),
    },
    post: {
      tags: ["Image"],
      summary: "Mở rộng: lưu ảnh",
      parameters: [pathParam("imageID", 3)],
      responses: responses(),
    },
    delete: {
      tags: ["Image"],
      summary: "Mở rộng: bỏ lưu ảnh",
      parameters: [pathParam("imageID", 3)],
      responses: responses(),
    },
  },
};
