import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import rootRouter from "./src/routers/root.router.js";
import { appError } from "./src/common/helpers/appError.helper.js";
import { NotFoundException } from "./src/common/helpers/exception.helper.js";
import { logAPI } from "./src/common/middlewares/log-api.middleware.js";
import { appLimit } from "./src/common/middlewares/rateLimit.middleware.js";
import { swaggerDocument } from "./src/common/swagger/init.swagger.js";
import { PORT } from "./src/common/constants/app.constant.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(logAPI());

app.use(express.static("public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", appLimit, rootRouter);

app.use((req, res, next) => {
  throw new NotFoundException(`Không tìm thấy API ${req.method} ${req.originalUrl}`);
});

app.use(appError);

app.listen(PORT, () => {
  console.log(`server online at localhost:${PORT}`);
  console.log(`swagger: localhost:${PORT}/api-docs`);
});
