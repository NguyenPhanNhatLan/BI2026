export const customerSchemas = {
  Customer: {
    type: "object",
    properties: {
      customer_id: { type: "string", example: "CG-12520" },
      customer_name: { type: "string", example: "Claire Gute" },
      city: { type: "string", example: "Ho Chi Minh City" },
    }
  },
  CustomerPaginatedResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Lấy danh sách khách hàng thành công" },
      data: { 
        type: "array", 
        items: { $ref: "#/components/schemas/Customer" } 
      },
      meta: {
        type: "object",
        properties: {
          currentPage: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          totalPages: { type: "integer", example: 5 },
          totalRecords: { type: "integer", example: 100 }
        }
      }
    }
  }
};