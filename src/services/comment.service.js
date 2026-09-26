import {
  ForbiddenException,
  NotFoundException,
} from "../common/helpers/exception.helper.js";
import { parseId } from "../common/helpers/validate.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const commentService = {
  async delete(req) {
    const commentId = parseId(req.params.commentID, "commentID");
    const userId = req.user.nguoi_dung_id;

    const comment = await prisma.binh_luan.findFirst({
      where: { binh_luan_id: commentId, isDeleted: false },
      include: { hinh_anh: { select: { nguoi_dung_id: true } } },
    });

    if (!comment) {
      throw new NotFoundException("Không tìm thấy bình luận");
    }

    const isOwner = comment.nguoi_dung_id === userId;
    const isImageOwner = comment.hinh_anh.nguoi_dung_id === userId;
    if (!isOwner && !isImageOwner) {
      throw new ForbiddenException("Bạn không có quyền xoá bình luận này");
    }

    await prisma.binh_luan.update({
      where: { binh_luan_id: commentId },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
    });

    return true;
  },
};
