import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.js";
import {
  isEmail,
  parseAge,
  requireString,
} from "../common/helpers/validate.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import bcrypt from "bcrypt";
import { tokenService } from "./token.service.js";

export const authService = {
  async register(req) {
    const { email, mat_khau, ho_ten, tuoi } = req.body || {};

    const emailValue = requireString(email, "email").toLowerCase();
    if (!isEmail(emailValue)) {
      throw new BadRequestException("Email không đúng định dạng");
    }
    if (typeof mat_khau !== "string" || mat_khau.length < 6) {
      throw new BadRequestException("Mật khẩu phải có ít nhất 6 ký tự");
    }
    const hoTen = requireString(ho_ten, "họ tên (ho_ten)");
    const tuoiValue = parseAge(tuoi) ?? null;

    const userExist = await prisma.nguoi_dung.findUnique({
      where: {
        email: emailValue,
      },
    });

    if (userExist) {
      throw new ConflictException("Email đã được đăng ký");
    }

    const hashPassword = bcrypt.hashSync(mat_khau, 10);

    const newUser = await prisma.nguoi_dung.create({
      data: {
        email: emailValue,
        mat_khau: hashPassword,
        ho_ten: hoTen,
        tuoi: tuoiValue,
      },
    });

    return newUser;
  },

  async login(req) {
    const { email, mat_khau } = req.body || {};

    if (typeof email !== "string" || typeof mat_khau !== "string") {
      throw new BadRequestException("Vui lòng nhập email và mật khẩu");
    }

    const userExist = await prisma.nguoi_dung.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        isDeleted: false,
      },
      omit: {
        mat_khau: false,
      },
    });

    if (!userExist) {
      throw new BadRequestException(
        "Email chưa được đăng ký. Vui lòng đăng ký tài khoản.",
      );
    }

    const isPasswordValid = bcrypt.compareSync(mat_khau, userExist.mat_khau);

    if (!isPasswordValid) {
      throw new BadRequestException(
        "Mật khẩu không chính xác. Vui lòng thử lại.",
      );
    }

    const accessToken = tokenService.createAccessToken(userExist.nguoi_dung_id);
    const refreshToken = tokenService.createRefreshToken(
      userExist.nguoi_dung_id,
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  },

  async getInfo(req) {
    const user = req.user;
    return user;
  },

  async refreshToken(req) {
    const { accessToken, refreshToken } = req.body || {};

    if (!accessToken || !refreshToken) {
      throw new BadRequestException("Vui lòng gửi accessToken và refreshToken");
    }

    const decodeAccessToken = tokenService.verifyAccessToken(accessToken, {
      ignoreExpiration: true,
    });

    const decodeRefreshToken = tokenService.verifyRefreshToken(refreshToken);

    if (decodeAccessToken.userId !== decodeRefreshToken.userId) {
      throw new UnauthorizedException("Token không hợp lệ");
    }

    const userExist = await prisma.nguoi_dung.findFirst({
      where: {
        nguoi_dung_id: decodeAccessToken.userId,
        isDeleted: false,
      },
    });

    if (!userExist) {
      throw new UnauthorizedException("Người dùng không tồn tại");
    }

    const newAccessToken = tokenService.createAccessToken(
      userExist.nguoi_dung_id,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    };
  },
};
