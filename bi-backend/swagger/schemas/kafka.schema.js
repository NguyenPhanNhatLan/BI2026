export const kafkaSchema = {
  EventPublishRequest: {
    type: "object",
    required: ["eventType", "payload"],
    properties: {
      eventType: {
        type: "string",
        description: "Tên hoặc phân loại sự kiện để Consumer biết cách xử lý",
        example: "NEW_CUSTOMER_CREATED",
      },
      payload: {
        type: "object",
        description:
          "Dữ liệu chi tiết của sự kiện (có thể chứa bất kỳ thông tin nào)",
        example: {
          customer_id: "482910",
          customer_name: "Nguyen Van A",
          action: "CREATE",
          source: "Web Admin",
        },
      },
    },
  },
  EventPublishResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Đã bắn message vào Kafka thành công!",
      },
    },
  },
};
