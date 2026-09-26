import express from "express";
import { imageController } from "../controllers/image.controller.js";
import { uploadDiskStorage } from "../common/multer/disk-storage.multer.js";

const imageRouter = express.Router();

imageRouter.get("/", imageController.findAll);
imageRouter.get("/search", imageController.search);

imageRouter.post("/", uploadDiskStorage.single("hinh_anh"), imageController.create);

imageRouter.get("/:imageID", imageController.findOne);
imageRouter.get("/:imageID/comment", imageController.findComments);
imageRouter.post("/:imageID/comment", imageController.createComment);
imageRouter.get("/:imageID/save", imageController.getSaveStatus);

imageRouter.post("/:imageID/save", imageController.saveImage);
imageRouter.delete("/:imageID/save", imageController.unsaveImage);
imageRouter.put("/:imageID", uploadDiskStorage.single("hinh_anh"), imageController.update);

imageRouter.delete("/:imageID", imageController.delete);

export default imageRouter;
