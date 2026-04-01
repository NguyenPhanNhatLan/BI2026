export const productSchemas = {
  ProductPaginatedResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { type: "array", items: { type: "object" } },
      meta: {
        type: "object",
        properties: {
          currentPage: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
          totalRecords: { type: "integer" }
        }
      }
    }
  }
};