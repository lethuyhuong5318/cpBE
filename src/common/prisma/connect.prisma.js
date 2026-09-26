import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.ts";
import { DATABASE_URL } from "../constants/app.constant.js";

const url = new URL(DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  port: Number(url.port) || 3306,
  timezone: "Z",
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({
  adapter,
  omit: {
    nguoi_dung: {
      mat_khau: true,
    },
  },
});

try {
  await prisma.$queryRaw`SELECT 1 + 1 AS result`;
  console.log("✅ [PRISMA] Connection has been established successfully.");
} catch (error) {
  console.error("❌ [PRISMA] Unable to connect to the database:", error.message);
}

export { prisma };
