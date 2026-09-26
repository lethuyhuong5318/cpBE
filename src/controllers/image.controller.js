import { responseSuccess } from "../common/helpers/response.helper.js";
import { statusCodes } from "../common/helpers/statusCode.helper.js";
import { imageService } from "../services/image.service.js";

export const imageController = {
  async findAll(req, res) {
    const result = await imageService.findAll(req);
    const response = responseSuccess(result, "Lấy danh sách ảnh thành công");
    res.status(response.statusCode).json(response);
  },

  async search(req, res) {
    const result = await imageService.search(req);
    const response = responseSuccess(result, "Tìm kiếm ảnh thành công");
    res.status(response.statusCode).json(response);
  },

  async findOne(req, res) {
    const result = await imageService.findOne(req);
    const response = responseSuccess(result, "Lấy thông tin ảnh thành công");
    res.status(response.statusCode).json(response);
  },

  async findComments(req, res) {
    const result = await imageService.findComments(req);
    const response = responseSuccess(result, "Lấy danh sách bình luận thành công");
    res.status(response.statusCode).json(response);
  },

  async createComment(req, res) {
    const result = await imageService.createComment(req);
    const response = responseSuccess(
      result,
      "Bình luận thành công",
      statusCodes.CREATED,
    );
    res.status(response.statusCode).json(response);
  },

  async getSaveStatus(req, res) {
    const result = await imageService.getSaveStatus(req);
    const response = responseSuccess(result, "Kiểm tra trạng thái lưu thành công");
    res.status(response.statusCode).json(response);
  },

  async saveImage(req, res) {
    const result = await imageService.saveImage(req);
    const response = responseSuccess(result, "Lưu ảnh thành công");
    res.status(response.statusCode).json(response);
  },

  async unsaveImage(req, res) {
    const result = await imageService.unsaveImage(req);
    const response = responseSuccess(result, "Bỏ lưu ảnh thành công");
    res.status(response.statusCode).json(response);
  },

  async create(req, res) {
    const result = await imageService.create(req);
    const response = responseSuccess(
      result,
      "Thêm ảnh thành công",
      statusCodes.CREATED,
    );
    res.status(response.statusCode).json(response);
  },

  async update(req, res) {
    const result = await imageService.update(req);
    const response = responseSuccess(result, "Cập nhật ảnh thành công");
    res.status(response.statusCode).json(response);
  },

  async delete(req, res) {
    const result = await imageService.delete(req);
    const response = responseSuccess(result, "Xoá ảnh thành công");
    res.status(response.statusCode).json(response);
  },
};
