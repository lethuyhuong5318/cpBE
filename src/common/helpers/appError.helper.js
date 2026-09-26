import { responseError } from "./response.helper.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { statusCodes } from "./statusCode.helper.js";

export const appError = (err, req, res, next) => {
  console.log("mid err đặc biệt", err);

  if (err instanceof jwt.JsonWebTokenError) {
    err.code = statusCodes.UNAUTHORIZED;
  }

  if (err instanceof jwt.TokenExpiredError) {
    err.code = statusCodes.FORBIDDEN;
  }

  if (err instanceof multer.MulterError) {
    err.code = statusCodes.BAD_REQUEST;
  }

  if (err?.type === "entity.parse.failed") {
    err.code = statusCodes.BAD_REQUEST;
    err.message = "Body không đúng định dạng JSON";
  }

  if (err?.code === "P2002") {
    err.code = statusCodes.CONFLICT;
    err.message = "Dữ liệu đã tồn tại";
  }

  if (err?.name === "PrismaClientValidationError") {
    err.code = statusCodes.BAD_REQUEST;
    err.message = "Dữ liệu truy vấn không hợp lệ";
  }

  const statusCode = Number.isInteger(err?.code) ? err.code : undefined;
  const response = responseError(err?.message, statusCode, err?.stack);
  res.status(response.statusCode).json(response);
};
