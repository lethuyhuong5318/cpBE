import { userService } from "../services/user.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const userController = {
  async getInfo(req, res, next) {
    const result = await userService.getInfo(req);
    const response = responseSuccess(result, `Lấy thông tin user thành công`);
    res.status(response.statusCode).json(response);
  },

  async findOne(req, res, next) {
    const result = await userService.findOne(req);
    const response = responseSuccess(result, `Lấy thông tin user thành công`);
    res.status(response.statusCode).json(response);
  },

  async findSavedImages(req, res, next) {
    const result = await userService.findSavedImages(req);
    const response = responseSuccess(result, `Lấy danh sách ảnh đã lưu thành công`);
    res.status(response.statusCode).json(response);
  },

  async findCreatedImages(req, res, next) {
    const result = await userService.findCreatedImages(req);
    const response = responseSuccess(result, `Lấy danh sách ảnh đã tạo thành công`);
    res.status(response.statusCode).json(response);
  },

  async updateInfo(req, res, next) {
    const result = await userService.updateInfo(req);
    const response = responseSuccess(result, `Cập nhật thông tin thành công`);
    res.status(response.statusCode).json(response);
  },

  async changePassword(req, res, next) {
    const result = await userService.changePassword(req);
    const response = responseSuccess(result, `Đổi mật khẩu thành công`);
    res.status(response.statusCode).json(response);
  },
};
