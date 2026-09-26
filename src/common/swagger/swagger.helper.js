export const pathParam = (name, example = 1) => ({
  in: "path",
  name: name,
  required: true,
  schema: { type: "integer", example: example },
});

export const queryParam = (name, type = "string", example) => ({
  in: "query",
  name: name,
  schema: { type: type, example: example },
});

export const pageParams = [
  queryParam("page", "integer", 1),
  queryParam("pageSize", "integer", 10),
];

export const jsonBody = (properties, required = []) => ({
  content: {
    "application/json": {
      schema: { type: "object", properties: properties, required: required },
    },
  },
});

export const formDataBody = (properties, required = []) => ({
  content: {
    "multipart/form-data": {
      schema: { type: "object", properties: properties, required: required },
    },
  },
});

export const responses = (extra = {}) => ({
  200: { description: "ok" },
  400: { description: "Dữ liệu không hợp lệ" },
  401: { description: "Chưa đăng nhập / token không hợp lệ" },
  403: { description: "Token hết hạn / không có quyền" },
  404: { description: "Không tìm thấy" },
  ...extra,
});
