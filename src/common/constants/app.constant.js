import "dotenv/config";

export const PORT = process.env.PORT || 3069;
export const DATABASE_URL = process.env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;
export const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;

if (!DATABASE_URL || !ACCESS_TOKEN_SECRET_KEY || !REFRESH_TOKEN_SECRET_KEY) {
  throw new Error(
    "Thiếu DATABASE_URL / ACCESS_TOKEN_SECRET_KEY / REFRESH_TOKEN_SECRET_KEY trong file .env",
  );
}
