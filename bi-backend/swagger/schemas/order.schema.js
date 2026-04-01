export const orderSchemas = {
  Order: {
    type: "object",
    properties: {
      order_id: { type: "string", example: "ORD001" },
      order_placement_date: { type: "string", example: "2026-03-01" },
      customer_id: { type: "string", example: "C001" },
    },
  },

  OrderItem: {
    type: "object",
    properties: {
      product_id: { type: "string", example: "P01" },
      ord_qty: { type: "integer", example: 2 },
      delivered_qty: { type: "integer", example: 0 },
      agreed_delivery_date: { type: "string", example: "2026-03-15" },
      actual_delivery_date: { type: "string", example: "2026-03-16" },
    },
  },

  OrderDetail: {
    type: "object",
    properties: {
      order_id: { type: "string" },
      order_placement_date: { type: "string" },
      order_lines: {
        type: "array",
        items: {
          $ref: "#/components/schemas/OrderItem",
        },
      },
    },
  },
  StandardResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { type: "object" }, // Hoặc array tùy ngữ cảnh
    },
  },

  // Schema riêng cho API có Phân trang (Meta)
  OrderPaginatedResponse: {
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
          totalRecords: { type: "integer" },
        },
      },
    },
  },

  // Schema riêng cho API Thống kê biểu đồ
  OrderSummaryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              totalOrders: { type: "integer" },
              totalRevenue: { type: "number" },
            },
          },
          chartData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", format: "date" },
                count: { type: "integer" },
                revenue: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};
