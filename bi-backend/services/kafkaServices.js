import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "bi-dashboard-client",
  brokers: ["100.117.178.115:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "operation-intelligence-group" });
let socketIoInstance;

export const initKafka = async (io) => {
  socketIoInstance = io;

  try {
    await producer.connect();
    console.log("[Kafka] Producer connected successfully");

    await consumer.connect();
    console.log("[Kafka] Consumer connected successfully");

    await consumer.subscribe({
      topic: "logistics_order_events",
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value.toString());
        handleRealTimeAlerts(event);
      },
    });
  } catch (error) {
    console.error("[Kafka] Lỗi khởi tạo:", error);
  }
};

const handleRealTimeAlerts = (event) => {
  if (!socketIoInstance) return;
  const { eventType, payload } = event;

  if (
    eventType === "ORDER_DELIVERED" &&
    payload.delivery_qty < payload.order_qty
  ) {
    const lostRevenue =
      (payload.order_qty - payload.delivery_qty) * (payload.price || 0);
    socketIoInstance.emit("OPERATIONAL_ALERT", {
      level: "CRITICAL",
      type: "IN_FULL_FAILURE",
      order_id: payload.order_id,
      message: `Giao thiếu hàng! Hụt mất $${lostRevenue.toLocaleString()} doanh thu.`,
    });
  }
};

export const sendMessageToKafka = async (topic, messageData) => {
  try {
    console.log(`[Kafka Debug] Đang chuẩn bị gửi message vào topic: ${topic}`);
    const messageString = JSON.stringify(messageData);
    
    const result = await producer.send({
      topic: topic,
      messages: [{ value: messageString }],
    });
    
    console.log(`[Kafka Debug] Đã gửi THÀNH CÔNG lên Kafka! Offset:`, result[0].baseOffset);
    return result;
  } catch (error) {
    console.error(`[Kafka LỖI CHÍNH MẠNG] Không thể gửi message:`, error);
    throw error;
  }
};
