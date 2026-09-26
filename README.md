# Capstone Express ORM – Pinterest clone

API Back End cho ứng dụng chia sẻ ảnh kèm theo Front End (JavaScript thuần).

## Cấu trúc thư mục

```
├── server.js                    # khởi tạo express, middleware, swagger, appError
├── prisma.config.ts / prisma/   # cấu hình + schema Prisma
├── postman/                     # file Postman collection (.json) để import
├── tests/                       # test tự động cho toàn bộ API (npm test)
├── public/
│   ├── index.html, assets/      # Front End (SPA, hash router, ES modules)
│   └── images/                  # ảnh upload (multer disk storage)
└── src/
    ├── routers/                 # khai báo route
    ├── controllers/             # nhận request, trả response (responseSuccess)
    ├── services/                # xử lý nghiệp vụ, truy vấn Prisma
    └── common/
        ├── constants/           # biến môi trường
        ├── helpers/             # response, exception, appError, buildQueryPrisma, validate
        ├── middlewares/         # protect (JWT), rateLimit, logAPI
        ├── multer/              # upload file
        ├── prisma/              # kết nối Prisma (+ client được generate)
        └── swagger/             # tài liệu API
```

## Cài đặt & chạy

```bash
npm install                 # tự chạy prisma generate
cp .env.example .env        # cấu hình biến môi trường
docker compose up -d        # chạy MySQL container
npm run dev                 # khởi chạy server (http://localhost:3069)
```
