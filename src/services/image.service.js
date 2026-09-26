import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../common/helpers/exception.helper.js";
import {
  buildPagination,
  buildQueryPrisma,
} from "../common/helpers/build-query-prisma.helper.js";
import {
  optionalString,
  optionalUrl,
  parseId,
  requireString,
} from "../common/helpers/validate.helper.js";
import { removeUploadedFile } from "../common/multer/disk-storage.multer.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const userPublicSelect = {
  nguoi_dung_id: true,
  ho_ten: true,
  ten_nguoi_dung: true,
  anh_dai_dien: true,
};

export const imageInclude = {
  nguoi_dung: { select: userPublicSelect },
};

export const findImagesPaginated = async (where, index, page, pageSize) => {
  const [items, totalItems] = await Promise.all([
    prisma.hinh_anh.findMany({
      where: where,
      include: imageInclude,
      orderBy: [{ createdAt: "desc" }, { hinh_id: "desc" }],
      skip: index,
      take: pageSize,
    }),
    prisma.hinh_anh.count({ where: where }),
  ]);

  return buildPagination(items, totalItems, page, pageSize);
};

const findImageOrThrow = async (hinhId) => {
  const image = await prisma.hinh_anh.findFirst({
    where: { hinh_id: hinhId, isDeleted: false },
  });
  if (!image) {
    throw new NotFoundException("Không tìm thấy hình ảnh");
  }
  return image;
};

export const imageService = {
  async findAll(req) {
    const { where, page, pageSize, index } = buildQueryPrisma(req);
    return findImagesPaginated(where, index, page, pageSize);
  },

  async search(req) {
    const tenHinh = requireString(req.query.ten_hinh, "tên hình (ten_hinh)");
    const { page, pageSize, index } = buildQueryPrisma(req);

    const where = {
      isDeleted: false,
      ten_hinh: { contains: tenHinh },
    };

    return findImagesPaginated(where, index, page, pageSize);
  },

  async findOne(req) {
    const hinhId = parseId(req.params.imageID, "imageID");

    const image = await prisma.hinh_anh.findFirst({
      where: { hinh_id: hinhId, isDeleted: false },
      include: {
        nguoi_dung: { select: userPublicSelect },
        _count: {
          select: {
            binh_luan: { where: { isDeleted: false } },
            luu_anh: { where: { isDeleted: false } },
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException("Không tìm thấy hình ảnh");
    }

    return image;
  },

  async findComments(req) {
    const hinhId = parseId(req.params.imageID, "imageID");
    await findImageOrThrow(hinhId);

    const { page, pageSize, index } = buildQueryPrisma(req);
    const where = { hinh_id: hinhId, isDeleted: false };

    const [items, totalItems] = await Promise.all([
      prisma.binh_luan.findMany({
        where: where,
        include: { nguoi_dung: { select: userPublicSelect } },
        orderBy: [{ ngay_binh_luan: "desc" }, { binh_luan_id: "desc" }],
        skip: index,
        take: pageSize,
      }),
      prisma.binh_luan.count({ where: where }),
    ]);

    return buildPagination(items, totalItems, page, pageSize);
  },

  async createComment(req) {
    const hinhId = parseId(req.params.imageID, "imageID");
    const noiDung = requireString(
      req.body?.noi_dung,
      "nội dung bình luận (noi_dung)",
      1000,
    );
    await findImageOrThrow(hinhId);

    const comment = await prisma.binh_luan.create({
      data: {
        nguoi_dung_id: req.user.nguoi_dung_id,
        hinh_id: hinhId,
        noi_dung: noiDung,
      },
      include: { nguoi_dung: { select: userPublicSelect } },
    });

    return comment;
  },

  async getSaveStatus(req) {
    const hinhId = parseId(req.params.imageID, "imageID");
    await findImageOrThrow(hinhId);

    const saved = await prisma.luu_anh.findUnique({
      where: {
        nguoi_dung_id_hinh_id: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          hinh_id: hinhId,
        },
      },
    });

    const daLuu = !!saved && !saved.isDeleted;
    return {
      hinh_id: hinhId,
      da_luu: daLuu,
      ngay_luu: daLuu ? saved.ngay_luu : null,
    };
  },

  async saveImage(req) {
    const hinhId = parseId(req.params.imageID, "imageID");
    await findImageOrThrow(hinhId);
    const userId = req.user.nguoi_dung_id;

    const saved = await prisma.luu_anh.upsert({
      where: {
        nguoi_dung_id_hinh_id: { nguoi_dung_id: userId, hinh_id: hinhId },
      },
      create: { nguoi_dung_id: userId, hinh_id: hinhId },
      update: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: 0,
        ngay_luu: new Date(),
      },
    });

    return { hinh_id: hinhId, da_luu: true, ngay_luu: saved.ngay_luu };
  },

  async unsaveImage(req) {
    const hinhId = parseId(req.params.imageID, "imageID");
    const userId = req.user.nguoi_dung_id;

    const result = await prisma.luu_anh.updateMany({
      where: { nguoi_dung_id: userId, hinh_id: hinhId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
    });

    if (result.count === 0) {
      throw new NotFoundException("Bạn chưa lưu hình ảnh này");
    }

    return { hinh_id: hinhId, da_luu: false, ngay_luu: null };
  },

  async create(req) {
    try {
      const body = req.body || {};
      const tenHinh = requireString(body.ten_hinh, "tiêu đề (ten_hinh)");
      const moTa = optionalString(body.mo_ta, "mô tả (mo_ta)", 5000);
      const lienKet = optionalUrl(body.lien_ket, "liên kết (lien_ket)");

      let duongDan;
      if (req.file) {
        duongDan = `/images/${req.file.filename}`;
      } else {
        duongDan = optionalUrl(body.duong_dan, "đường dẫn (duong_dan)");
        if (!duongDan) {
          throw new BadRequestException(
            "Vui lòng upload file ảnh (field hinh_anh) hoặc gửi đường dẫn ảnh (duong_dan)",
          );
        }
      }

      const image = await prisma.hinh_anh.create({
        data: {
          ten_hinh: tenHinh,
          duong_dan: duongDan,
          mo_ta: moTa ?? null,
          lien_ket: lienKet ?? null,
          nguoi_dung_id: req.user.nguoi_dung_id,
        },
        include: imageInclude,
      });

      return image;
    } catch (error) {
      removeUploadedFile(req.file);
      throw error;
    }
  },

  async update(req) {
    try {
      const hinhId = parseId(req.params.imageID, "imageID");
      const image = await findImageOrThrow(hinhId);

      if (image.nguoi_dung_id !== req.user.nguoi_dung_id) {
        throw new ForbiddenException("Bạn không có quyền sửa hình ảnh này");
      }

      const body = req.body || {};
      const data = {};
      if (body.ten_hinh !== undefined) {
        data.ten_hinh = requireString(body.ten_hinh, "tiêu đề (ten_hinh)");
      }
      if (body.mo_ta !== undefined) {
        data.mo_ta = optionalString(body.mo_ta, "mô tả (mo_ta)", 5000);
      }
      if (body.lien_ket !== undefined) {
        data.lien_ket = optionalUrl(body.lien_ket, "liên kết (lien_ket)");
      }
      if (req.file) {
        data.duong_dan = `/images/${req.file.filename}`;
      }

      const updated = await prisma.hinh_anh.update({
        where: { hinh_id: hinhId },
        data: data,
        include: imageInclude,
      });

      return updated;
    } catch (error) {
      removeUploadedFile(req.file);
      throw error;
    }
  },

  async delete(req) {
    const hinhId = parseId(req.params.imageID, "imageID");
    const image = await findImageOrThrow(hinhId);
    const userId = req.user.nguoi_dung_id;

    if (image.nguoi_dung_id !== userId) {
      throw new ForbiddenException("Bạn không có quyền xoá hình ảnh này");
    }

    await prisma.hinh_anh.update({
      where: { hinh_id: hinhId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return true;
  },
};
