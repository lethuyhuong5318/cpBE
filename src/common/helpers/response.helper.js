import { statusCodes } from "./statusCode.helper.js";

export const responseSuccess = (
  result,
  message = "Lấy danh sách thành công",
  statusCode = statusCodes.OK,
) => {
  return {
    status: "success",
    statusCode: statusCode,
    message: message,
    data: result,
    doc: "/api-docs",
  };
};

export const responseError = (
  message = "Internal server error",
  statusCode = statusCodes.INTERNAL_SERVER_ERROR,
  stack,
) => {
  return {
    status: "error",
    statusCode: statusCode,
    message: message,
    stack: process.env.NODE_ENV === "production" ? undefined : stack,
    doc: "/api-docs",
  };
};
