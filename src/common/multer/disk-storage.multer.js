import multer from "multer";
import path from "path";
import fs from "fs";
import { BadRequestException } from "../helpers/exception.helper.js";

export const IMAGE_FOLDER = "public/images";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${IMAGE_FOLDER}/`);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname).toLowerCase();

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, "local" + "-" + uniqueSuffix + fileExt);
  },
});

const fileFilter = (req, file, cb) => {
  const allowTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowTypes.includes(file.mimetype)) {
    return cb(new BadRequestException("Chỉ cho phép upload file ảnh (jpg, png, gif, webp)"));
  }
  cb(null, true);
};

export const uploadDiskStorage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const removeUploadedFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

