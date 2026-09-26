import express from "express";
import { userController } from "../controllers/user.controller.js";
import { uploadDiskStorage } from "../common/multer/disk-storage.multer.js";

const userRouter = express.Router();

userRouter.get("/info", userController.getInfo);
userRouter.get("/saved-image", userController.findSavedImages);
userRouter.get("/created-image", userController.findCreatedImages);

userRouter.put(
  "/info",
  uploadDiskStorage.single("anh_dai_dien"),
  userController.updateInfo,
);
userRouter.put("/change-password", userController.changePassword);

userRouter.get("/:userID", userController.findOne);
userRouter.get("/:userID/saved-image", userController.findSavedImages);
userRouter.get("/:userID/created-image", userController.findCreatedImages);

export default userRouter;
