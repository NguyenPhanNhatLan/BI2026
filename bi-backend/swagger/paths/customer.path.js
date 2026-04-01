export const customerPaths = {
  "/customers": {
    get: {
      tags: ["Customers"],
      summary:
        "Lấy danh sách khách hàng (Có phân trang, tìm kiếm, kèm chỉ số Target)",
      description:
        "Lấy danh sách khách hàng bao gồm thông tin cơ bản và các chỉ số mục tiêu (infull, ontime, otif). Hỗ trợ tìm kiếm linh hoạt theo thành phố và phân trang.",
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Số trang hiện tại",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Số lượng bản ghi trên mỗi trang",
        },
        {
          name: "city",
          in: "query",
          schema: { type: "string" },
          description: "Từ khóa tìm kiếm (theo thành phố)",
        },
      ],
      responses: {
        200: {
          description: "Thành công lấy danh sách khách hàng",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CustomerPaginatedResponse",
              },
            },
          },
        },
        500: {
          description: "Lỗi server trong quá trình truy xuất dữ liệu",
        },
      },
    },
    delete: {
      tags: ["Customers"],
      summary: "Xoá khách hàng",
      parameters: [
        {
          name: "customer_id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID của khách hàng cần xoá",
        },
      ],
      responses: {
        200: {
          description: "Xoá khách hàng thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Customer deleted successfully",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy khách hàng",
        },
        500: {
          description: "Lỗi server",
        },
      },
    },

    post: {
      tags: ["Customers"],
      summary: "Tạo khách hàng mới và thiết lập chỉ số mục tiêu",
      description:
        "Tạo mới một khách hàng với thông tin cơ bản (lưu vào bảng customer) và các chỉ số mục tiêu ban đầu (lưu vào bảng target_orders).",

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              // Thêm 'target' vào danh sách các trường bắt buộc phải có
              required: ["customer_name", "city", "target"],
              properties: {
                customer_name: {
                  type: "string",
                  example: "Nguyen Van A",
                },
                city: {
                  type: "string",
                  example: "Ho Chi Minh",
                },
                target: {
                  type: "object",
                  description: "Các chỉ số hiệu suất mục tiêu của khách hàng",
                  required: ["infull", "ontime", "otif"],
                  properties: {
                    infull: {
                      type: "number",
                      example: 100,
                      description: "Tỷ lệ giao hàng đầy đủ (%)",
                    },
                    ontime: {
                      type: "number",
                      example: 95,
                      description: "Tỷ lệ giao hàng đúng hạn (%)",
                    },
                    otif: {
                      type: "number",
                      example: 90,
                      description: "Tỷ lệ giao hàng đúng hạn và đầy đủ (%)",
                    },
                  },
                },
              },
            },
          },
        },
      },

      responses: {
        201: {
          description: "Tạo khách hàng và thiết lập chỉ số mục tiêu thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Khách hàng và các chỉ số mục tiêu đã được tạo thành công.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      customer_id: { type: "string", example: "482910" },
                      customer_name: {
                        type: "string",
                        example: "Nguyen Van A",
                      },
                      city: { type: "string", example: "Ho Chi Minh" },
                      target: {
                        type: "object",
                        properties: {
                          infull: { type: "number", example: 100 },
                          ontime: { type: "number", example: 95 },
                          otif: { type: "number", example: 90 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Thiếu dữ liệu hoặc payload không hợp lệ (ví dụ: thiếu object target)",
        },
        500: {
          description: "Lỗi server trong quá trình lưu dữ liệu",
        },
      },
    },
  },
};
