export const buildQueryPrisma = (req) => {
  let { page, pageSize, filters } = req.query;

  try {
    filters = JSON.parse(filters);
  } catch (error) {
    filters = {};
  }

  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    filters = {};
  }
  delete filters.isDeleted;

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string") {
      filters[key] = {
        contains: value,
      };
    }
  });

  const where = {
    isDeleted: false,
    ...filters,
  };

  const pageDefault = 1;
  const pageSizeDefault = 10;
  const pageSizeMax = 100;

  page = Math.floor(Number(page)) || pageDefault;
  pageSize = Math.floor(Number(pageSize)) || pageSizeDefault;

  if (page < 1) page = pageDefault;
  if (pageSize < 1) pageSize = pageSizeDefault;
  if (pageSize > pageSizeMax) pageSize = pageSizeMax;

  const index = (page - 1) * pageSize;

  return {
    where,
    page,
    pageSize,
    index,
  };
};

export const buildPagination = (items, totalItems, page, pageSize) => {
  return {
    items: items,
    totalItems: totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    page: page,
    pageSize: pageSize,
  };
};
