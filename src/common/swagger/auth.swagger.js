import { jsonBody, responses } from "./swagger.helper.js";

export const auth = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Trang đăng ký: đăng ký tài khoản",
      security: [],
      requestBody: jsonBody(
        {
          email: { type: "string", example: "test@gmail.com" },
          mat_khau: { type: "string", example: "123456" },
          ho_ten: { type: "string", example: "Nguyễn Văn A" },
          tuoi: { type: "integer", example: 20 },
        },
        ["email", "mat_khau", "ho_ten"],
      ),
      responses: responses({ 201: { description: "Đăng ký thành công" }, 409: { description: "Email đã tồn tại" } }),
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Trang đăng nhập: trả về accessToken, refreshToken",
      security: [],
      requestBody: jsonBody(
        {
          email: { type: "string", example: "sang@gmail.com" },
          mat_khau: { type: "string", example: "123456" },
        },
        ["email", "mat_khau"],
      ),
      responses: responses(),
    },
  },
  "/auth/refresh-token": {
    post: {
      tags: ["Auth"],
      summary: "Làm mới accessToken",
      security: [],
      requestBody: jsonBody(
        {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
        ["accessToken", "refreshToken"],
      ),
      responses: responses(),
    },
  },
  "/auth/get-info": {
    get: {
      tags: ["Auth"],
      summary: "Lấy thông tin user từ token",
      responses: responses(),
    },
  },
};
