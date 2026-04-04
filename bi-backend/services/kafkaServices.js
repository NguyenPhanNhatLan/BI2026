import { Kafka } from "kafkajs";
import clickhouse from "../config/clickhouse.js";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "bi-dashboard-client",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "operation-intelligence-group-v2" });
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
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ message, partition }) => {
        try {
          const messageString = message.value ? message.value.toString() : "";
          if (!messageString) {
            console.warn("[Kafka] Nhận được message rỗng, bỏ qua.");
            return;
          }

          const event = JSON.parse(messageString);

          handleRealTimeAlerts(event);

          try {
            const payloadStr =
              typeof event.payload === "string"
                ? event.payload
                : JSON.stringify(event.payload || {});

            await clickhouse.insert({
              table: "kafka_order_events_queue",
              values: [
                {
                  aggregate_id:
                    event.aggregate_id || event.payload?.order_id || "unknown",
                  eventType: event.eventType || "UNKNOWN",
                  payload: payloadStr,
                  timestamp: event.timestamp || new Date().toISOString(),
                },
              ],
              format: "JSONEachRow",
            });
            console.log(
              `[ClickHouse] Đã đồng bộ sự kiện ${event.eventType} (Partition: ${partition}) thành công!`,
            );
          } catch (dbError) {
            console.error("[ClickHouse] Lỗi khi ghi sự kiện:", dbError.message);
          }
        } catch (parseError) {
          console.error(
            `[Kafka LỖI DỮ LIỆU] Không thể parse message: ${message.value?.toString()}`,
          );
          console.error(
            `[Kafka] Bỏ qua message lỗi để tránh ứ đọng. Chi tiết:`,
            parseError.message,
          );
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

    console.log(
      `[Kafka Debug] Đã gửi THÀNH CÔNG lên Kafka! Offset:`,
      result[0].baseOffset,
    );
    return result;
  } catch (error) {
    console.error(`[Kafka LỖI CHÍNH MẠNG] Không thể gửi message:`, error);
    throw error;
  }
};
