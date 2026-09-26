import { responseSuccess } from "../common/helpers/response.helper.js";
import { commentService } from "../services/comment.service.js";

export const commentController = {
  async delete(req, res) {
    const result = await commentService.delete(req);
    const response = responseSuccess(result, "Xoá bình luận thành công");
    res.status(response.statusCode).json(response);
  },
};
