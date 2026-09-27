import { auth } from "./auth.swagger.js";
import { image } from "./image.swagger.js";
import { user } from "./user.swagger.js";
import { pathParam, responses } from "./swagger.helper.js";
import { PORT } from "../constants/app.constant.js";

const comment = {
  "/comment/{commentID}": {
    delete: {
      tags: ["Comment"],
      summary: "Mở rộng: xoá bình luận (người viết hoặc chủ ảnh)",
      parameters: [pathParam("commentID")],
      responses: responses(),
    },
  },
};

export const swaggerDocument = {
  openapi: "3.0.4",
  info: {
    title: "Capstone Express ORM API",
    description:
      "API Back End cho ứng dụng chia sẻ ảnh (Pinterest clone). Đăng nhập lấy accessToken rồi bấm **Authorize** để gắn token.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "/api",
      description: "Production / Current server",
    },
    {
      url: `http://localhost:${PORT}/api`,
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    ...auth,
    ...image,
    ...user,
    ...comment,
  },
};
