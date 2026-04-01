export const productPaths = {
  "/products": {
    get: {
      tags: ["Products"],
      summary: "Lấy danh sách sản phẩm (Có phân trang, tìm kiếm)",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "search", in: "query", schema: { type: "string" }, description: "Tìm theo tên" },
        { name: "category", in: "query", schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Thành công",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductPaginatedResponse" } } }
        }
      }
    },
    post: {
      tags: ["Products"],
      summary: "Tạo sản phẩm mới",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["product_name", "price"],
              properties: {
                product_name: { type: "string" },
                category: { type: "string" },
                price: { type: "number" },
                cost: { type: "number" }
              }
            }
          }
        }
      },
      responses: {
        201: { description: "Tạo thành công" }
      }
    }
  },
  "/products/{id}": {
    put: {
      tags: ["Products"],
      summary: "Cập nhật sản phẩm",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { /* Giống hệt phần post ở trên nhưng các trường không required */ },
      responses: { 200: { description: "Cập nhật thành công" } }
    },
    delete: {
      tags: ["Products"],
      summary: "Xóa sản phẩm",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Xóa thành công" } }
    }
  }
};
