import { sendMessageToKafka } from "../services/kafkaServices.js";

export async function publishEventController(req, res) {
  try {
    const { eventType, payload } = req.body;

    if (!eventType || !payload) {
      return res.status(400).json({
        success: true,
        message: "Thiếu eventType hoặc payload",
      });
    }

    const topic = "realtime-reports";

    await sendMessageToKafka(topic, {
      event: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
    });
    return res.status(200).json({
      success: true,
      message: "Đã bắn message vào Kafka thành công!",
    });
  } catch (error) {
    console.error("Lỗi API publish Kafka:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
