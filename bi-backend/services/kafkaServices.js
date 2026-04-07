import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "alert-worker",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "alert-group" });
let socketIoInstance;

export const initKafka = async (io) => {
  socketIoInstance = io;

  try {
    await producer.connect();
    console.log("[Kafka] Producer connected successfully");

    await consumer.connect();
    console.log("[Kafka] Consumer connected successfully");

    await consumer.subscribe({
      topic: "orders_topic",
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ message, partition, offset }) => {
        try {
          const messageString = message.value ? message.value.toString() : "";
          if (!messageString) return;

          const event = JSON.parse(messageString);
          handleRealTimeAlerts(event);

          console.log(`[Alert-Worker] Đã xử lý xong event: ${event.eventType} (Offset: ${offset})`);
          
        } catch (parseError) {
          console.error(`[Kafka LỖI DỮ LIỆU] Không thể parse message: ${message.value?.toString()}`);
        }
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
    payload &&
    payload.delivery_qty < payload.order_qty
  ) {
    const lostRevenue = (payload.order_qty - payload.delivery_qty) * (payload.price || 0);
    
    socketIoInstance.emit("OPERATIONAL_ALERT", {
      level: "CRITICAL",
      type: "IN_FULL_FAILURE",
      order_id: payload.id || payload.order_id,
      message: `Giao thiếu hàng! Hụt mất $${lostRevenue.toLocaleString()} doanh thu.`,
    });
  }
};

export const sendMessageToKafka = async (topic, messageData) => {
  try {
    const messageString = JSON.stringify(messageData);
    const result = await producer.send({
      topic: topic,
      messages: [{ value: messageString }],
    });
    return result;
  } catch (error) {
    console.error(`[Kafka] Không thể gửi message:`, error);
    throw error;
  }
};

