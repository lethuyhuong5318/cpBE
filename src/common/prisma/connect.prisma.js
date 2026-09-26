import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.ts";
import { DATABASE_URL } from "../constants/app.constant.js";

const connectionString = DATABASE_URL || "mysql://root:1234@localhost:3306/capstone_express_orm";
let url;
try {
  url = new URL(connectionString);
} catch {
  url = new URL("mysql://root:1234@localhost:3306/capstone_express_orm");
}

const adapter = new PrismaMariaDb({
  host: url.hostname,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1) || "capstone_express_orm",
  port: Number(url.port) || 3306,
  timezone: "Z",
  allowPublicKeyRetrieval: true,
  ssl: ["true", "required"].includes(url.searchParams.get("ssl")) ? { rejectUnauthorized: true } : undefined,
});

const prisma = new PrismaClient({
  adapter,
  omit: {
    nguoi_dung: {
      mat_khau: true,
    },
  },
});

export { prisma };
