export const kafkaPaths = {
  "/events/publish": {
    post: {
      tags: ["Events"],
      summary: "Bắn sự kiện (message) vào luồng Kafka",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/EventPublishRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Bắn message vào Kafka thành công",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EventPublishResponse",
              },
            },
          },
        },
        400: {
          description: "Thiếu dữ liệu đầu vào (eventType hoặc payload)",
        },
        500: {
          description: "Lỗi server hoặc mất kết nối tới Kafka Broker",
        },
      },
    },
  },
};
