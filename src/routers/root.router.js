import express from "express";
import authRouter from "./auth.router.js";
import imageRouter from "./image.router.js";
import userRouter from "./user.router.js";
import commentRouter from "./comment.router.js";
import { protect } from "../common/middlewares/protect.middleware.js";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);

rootRouter.use("/image", protect, imageRouter);
rootRouter.use("/user", protect, userRouter);
rootRouter.use("/comment", protect, commentRouter);

export default rootRouter;
