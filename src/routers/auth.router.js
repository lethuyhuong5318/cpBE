import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";
import { loginLimit } from "../common/middlewares/rateLimit.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", loginLimit, authController.login);

authRouter.post("/refresh-token", authController.refreshToken);
authRouter.get("/get-info", protect, authController.getInfo);

export default authRouter;
