import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} from "../common/constants/app.constant.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import jwt from "jsonwebtoken";
export const tokenService = {
  createAccessToken(userID) {
    if (!userID) {
      throw new BadRequestException("Không có userID để tạo access token");
    }

    const accessToken = jwt.sign({ userId: userID }, ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: "1d",
    });

    return accessToken;
  },

  createRefreshToken(userID) {
    if (!userID) {
      throw new BadRequestException("Không có userID để tạo refresh token");
    }

    const refreshToken = jwt.sign(
      { userId: userID },
      REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );

    return refreshToken;
  },

  verifyAccessToken(accessToken, option) {
    const decode = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY, option);
    return decode;
  },

  verifyRefreshToken(refreshToken, option) {
    const decode = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, option);
    return decode;
  },
};
