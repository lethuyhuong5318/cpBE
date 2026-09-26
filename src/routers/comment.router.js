import express from "express";
import { commentController } from "../controllers/comment.controller.js";

const commentRouter = express.Router();

commentRouter.delete("/:commentID", commentController.delete);

export default commentRouter;
