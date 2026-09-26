import rateLimit from "express-rate-limit";
import { TooManyRequestsException } from "../helpers/exception.helper.js";

export const appLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: () => {
    throw new TooManyRequestsException();
  },
});

export const loginLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: () => {
    throw new TooManyRequestsException(
      "Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
    );
  },
});
