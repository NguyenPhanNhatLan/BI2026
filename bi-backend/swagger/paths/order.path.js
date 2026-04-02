const paramId = { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Mã đơn hàng" };
const paramStatus = { name: "status", in: "query", schema: { type: "string" }, description: "VD: completed, pending" };
const paramFromDate = { name: "from", in: "query", schema: { type: "string", format: "date" }, description: "YYYY-MM-DD" };
const paramToDate = { name: "to", in: "query", schema: { type: "string", format: "date" }, description: "YYYY-MM-DD" };

const paginationParams = [
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
];

const standardSuccessResponse = {
  200: {
    description: "Thành công",
    content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } }
  }
};

export const orderPaths = {

  "/orders": {
    post: {
      tags: ["Orders Management"],
      summary: "Tạo đơn hàng mới (Kèm danh sách sản phẩm)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["customer_id", "items"],
              properties: {
                customer_id: { type: "string", example: "CUST-001" },
                status: { type: "string", example: "pending" },
                items: {
                  type: "array",
                  description: "Danh sách sản phẩm mua",
                  items: {
                    type: "object",
                    required: ["product_id", "order_qty"],
                    properties: {
                      product_id: { type: "string", example: "PRD-102" },
                      order_qty: { type: "integer", example: 2 }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: { 201: { description: "Tạo đơn hàng thành công" } }
    }
  },

  // --- DASHBOARD & FILTER API ---
  "/orders/summary": {
    get: {
      tags: ["Orders Dashboard"],
      summary: "Lấy số liệu thống kê tổng quan và dữ liệu biểu đồ",
      parameters: [paramStatus, paramFromDate, paramToDate],
      responses: {
        200: {
          description: "Thành công",
          content: { "application/json": { schema: { $ref: "#/components/schemas/OrderSummaryResponse" } } }
        }
      }
    }
  },

  "/orders/filter": {
    get: {
      tags: ["Orders Dashboard"],
      summary: "Lọc danh sách đơn hàng chi tiết (Có phân trang)",
      parameters: [...paginationParams, paramStatus, paramFromDate, paramToDate],
      responses: {
        200: {
          description: "Thành công",
          content: { "application/json": { schema: { $ref: "#/components/schemas/OrderPaginatedResponse" } } }
        }
      }
    }
  },

  // --- OPERATIONS API (CHI TIẾT ĐƠN HÀNG) ---
  "/orders/{id}": {
    get: {
      tags: ["Orders Operations"],
      summary: "Lấy thông tin cơ bản của đơn hàng",
      parameters: [paramId],
      responses: standardSuccessResponse
    },
    delete: {
      tags: ["Orders Management"],
      summary: "Xoá đơn hàng (Xoá cả Master lẫn Detail)",
      parameters: [paramId],
      responses: {
        200: { description: "Xoá đơn hàng thành công" },
        500: { description: "Lỗi server hoặc rào cản từ Database" }
      }
    }
  },

  "/orders/{id}/items": {
    get: {
      tags: ["Orders Operations"],
      summary: "Lấy danh sách sản phẩm trong đơn hàng",
      parameters: [paramId],
      responses: standardSuccessResponse
    }
  },

  "/orders/{id}/full": {
    get: {
      tags: ["Orders Operations"],
      summary: "Lấy chi tiết đầy đủ của đơn hàng (Bao gồm Khách hàng và Sản phẩm)",
      parameters: [paramId],
      responses: standardSuccessResponse
    }
  }
};