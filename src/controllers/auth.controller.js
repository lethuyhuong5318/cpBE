import { authService } from "../services/auth.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
import { statusCodes } from "../common/helpers/statusCode.helper.js";

export const authController = {
  async register(req, res, next) {
    const result = await authService.register(req);
    const response = responseSuccess(
      result,
      `Đăng ký thành công`,
      statusCodes.CREATED,
    );
    res.status(response.statusCode).json(response);
  },

  async login(req, res, next) {
    const result = await authService.login(req);
    const response = responseSuccess(result, `Đăng nhập thành công`);
    res.status(response.statusCode).json(response);
  },

  async getInfo(req, res, next) {
    const result = await authService.getInfo(req);
    const response = responseSuccess(result, `Lấy thông tin thành công`);
    res.status(response.statusCode).json(response);
  },

  async refreshToken(req, res, next) {
    const result = await authService.refreshToken(req);
    const response = responseSuccess(result, `Làm mới token thành công`);
    res.status(response.statusCode).json(response);
  },
};
