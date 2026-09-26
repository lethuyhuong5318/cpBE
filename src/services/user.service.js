import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../common/helpers/exception.helper.js";
import {
  buildPagination,
  buildQueryPrisma,
} from "../common/helpers/build-query-prisma.helper.js";
import {
  optionalString,
  optionalUrl,
  parseAge,
  parseId,
  requireString,
} from "../common/helpers/validate.helper.js";
import {
  IMAGE_FOLDER,
  removeUploadedFile,
} from "../common/multer/disk-storage.multer.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { findImagesPaginated, imageInclude } from "./image.service.js";

const userProfileSelect = {
  nguoi_dung_id: true,
  ho_ten: true,
  tuoi: true,
  anh_dai_dien: true,
  ten_nguoi_dung: true,
  gioi_thieu: true,
  trang_web: true,
  createdAt: true,
};

const getTargetUserId = (req) => {
  if (req.params.userID !== undefined) {
    return parseId(req.params.userID, "userID");
  }
  return req.user.nguoi_dung_id;
};

const countUserImages = async (userId) => {
  const [daTao, daLuu] = await Promise.all([
    prisma.hinh_anh.count({ where: { nguoi_dung_id: userId, isDeleted: false } }),
    prisma.luu_anh.count({
      where: {
        nguoi_dung_id: userId,
        isDeleted: false,
        hinh_anh: { isDeleted: false },
      },
    }),
  ]);
  return { so_anh_da_tao: daTao, so_anh_da_luu: daLuu };
};

const removeOldLocalAvatar = (avatar) => {
  if (avatar?.startsWith("/images/")) {
    const oldFilePath = path.join(IMAGE_FOLDER, path.basename(avatar));
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }
};

export const userService = {
  async getInfo(req) {
    const thongKe = await countUserImages(req.user.nguoi_dung_id);
    return { ...req.user, ...thongKe };
  },

  async findOne(req) {
    const userId = parseId(req.params.userID, "userID");
    const user = await prisma.nguoi_dung.findFirst({
      where: { nguoi_dung_id: userId, isDeleted: false },
      select: userProfileSelect,
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const thongKe = await countUserImages(userId);
    return { ...user, ...thongKe };
  },

  async findSavedImages(req) {
    const userId = getTargetUserId(req);
    const { page, pageSize, index } = buildQueryPrisma(req);

    const where = {
      nguoi_dung_id: userId,
      isDeleted: false,
      hinh_anh: { isDeleted: false },
    };

    const [saved, totalItems] = await Promise.all([
      prisma.luu_anh.findMany({
        where: where,
        include: { hinh_anh: { include: imageInclude } },
        orderBy: [{ ngay_luu: "desc" }, { hinh_id: "desc" }],
        skip: index,
        take: pageSize,
      }),
      prisma.luu_anh.count({ where: where }),
    ]);

    const items = saved.map((item) => ({
      ...item.hinh_anh,
      ngay_luu: item.ngay_luu,
    }));

    return buildPagination(items, totalItems, page, pageSize);
  },

  async findCreatedImages(req) {
    const userId = getTargetUserId(req);
    const { page, pageSize, index } = buildQueryPrisma(req);

    const where = { nguoi_dung_id: userId, isDeleted: false };
    return findImagesPaginated(where, index, page, pageSize);
  },

  async updateInfo(req) {
    try {
      const body = req.body || {};
      const userId = req.user.nguoi_dung_id;
      const data = {};

      if (body.ho_ten !== undefined) {
        data.ho_ten = requireString(body.ho_ten, "họ tên (ho_ten)");
      }
      if (body.tuoi !== undefined) {
        data.tuoi = parseAge(body.tuoi);
      }
      if (body.gioi_thieu !== undefined) {
        data.gioi_thieu = optionalString(body.gioi_thieu, "giới thiệu (gioi_thieu)", 1000);
      }
      if (body.trang_web !== undefined) {
        data.trang_web = optionalUrl(body.trang_web, "trang web (trang_web)");
      }
      if (body.ten_nguoi_dung !== undefined) {
        const tenNguoiDung = optionalString(body.ten_nguoi_dung, "tên người dùng", 30);
        if (tenNguoiDung && !/^[a-zA-Z0-9_.]{3,30}$/.test(tenNguoiDung)) {
          throw new BadRequestException(
            "Tên người dùng (ten_nguoi_dung) chỉ gồm chữ không dấu, số, dấu _ và dấu . (3-30 ký tự)",
          );
        }
        if (tenNguoiDung) {
          const exist = await prisma.nguoi_dung.findFirst({
            where: {
              ten_nguoi_dung: tenNguoiDung,
              NOT: { nguoi_dung_id: userId },
            },
          });
          if (exist) {
            throw new ConflictException("Tên người dùng đã tồn tại");
          }
        }
        data.ten_nguoi_dung = tenNguoiDung;
      }

      if (req.file) {
        data.anh_dai_dien = `/images/${req.file.filename}`;
      } else if (body.anh_dai_dien !== undefined) {
        data.anh_dai_dien = optionalUrl(body.anh_dai_dien, "ảnh đại diện (anh_dai_dien)");
      }

      if (Object.keys(data).length === 0) {
        throw new BadRequestException("Không có thông tin nào để cập nhật");
      }

      const updated = await prisma.nguoi_dung.update({
        where: { nguoi_dung_id: userId },
        data: data,
      });

      if (data.anh_dai_dien !== undefined && req.user.anh_dai_dien !== data.anh_dai_dien) {
        removeOldLocalAvatar(req.user.anh_dai_dien);
      }

      return updated;
    } catch (error) {
      removeUploadedFile(req.file);
      throw error;
    }
  },

  async changePassword(req) {
    const { mat_khau_cu, mat_khau_moi } = req.body || {};

    if (typeof mat_khau_cu !== "string" || typeof mat_khau_moi !== "string") {
      throw new BadRequestException("Vui lòng nhập mat_khau_cu và mat_khau_moi");
    }
    if (mat_khau_moi.length < 6) {
      throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    const user = await prisma.nguoi_dung.findUnique({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
      omit: { mat_khau: false },
    });

    if (!bcrypt.compareSync(mat_khau_cu, user.mat_khau)) {
      throw new BadRequestException("Mật khẩu cũ không chính xác");
    }

    await prisma.nguoi_dung.update({
      where: { nguoi_dung_id: user.nguoi_dung_id },
      data: { mat_khau: bcrypt.hashSync(mat_khau_moi, 10) },
    });

    return true;
  },
};
