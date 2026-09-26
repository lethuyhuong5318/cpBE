import "dotenv/config";

export const PORT = process.env.PORT || 3069;
export const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:1234@localhost:3306/capstone_express_orm";
export const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || "default_access_token_secret_key_capstone_123456";
export const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY || "default_refresh_token_secret_key_capstone_123456";

if (!process.env.DATABASE_URL || !process.env.ACCESS_TOKEN_SECRET_KEY || !process.env.REFRESH_TOKEN_SECRET_KEY) {
  console.warn(
    "⚠️ Cảnh báo: Một số biến môi trường chưa được thiết lập trên Vercel Environment Variables. Đang dùng giá trị mặc định.",
  );
}
