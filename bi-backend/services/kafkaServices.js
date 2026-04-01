import { Kafka } from "kafkajs";
import { io } from "../server.js";
import { json } from "express";

const kafka = new Kafka({
  clientId: "bi-dashboard-consumer",
  brokers: ["100.117.178.115:9092"],
});

const consumer = kafka.consumer({ groupId: "operation-intelligence-group" });
const producer = kafka.producer();

export const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    console.log("[Kafka] Consumer connected successfully");

    await consumer.subscribe({
      topic: "logistics_order_events",
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`[Kafka] Nhận event mới: ${event.eventType}`);

          if (event.eventType === "ORDER_DELIVERED") {
            const { order_id, order_qty, delivery_qty, price, note } =
              event.payload;

            if (delivery_qty < order_qty) {
              const lostRevenue = (order_qty - delivery_qty) * price;

              io.emit("OPERATIONAL_ALERT", {
                level: "CRITICAL",
                type: "IN_FULL_FAILURE",
                order_id: order_id,
                message: `Giao thiếu hàng! Hụt mất $${lostRevenue.toLocaleString()} doanh thu.`,
                note: note || "Không có ghi chú từ tài xế",
                timestamp: new Date().toISOString(),
              });
            } else {
              io.emit("KPI_UPDATE", { type: "DELIVERY_SUCCESS", order_id });
            }
          }

          if (event.eventType === "TRANSIT_DELAY_WARNING") {
            io.emit("OPERATIONAL_ALERT", {
              level: "WARNING",
              type: "TRANSIT_DELAY",
              order_id: event.payload.order_id,
              message: `Đơn hàng đang có nguy cơ trễ SLA vận chuyển.`,
              note: event.payload.note,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (parseError) {
          console.error("[Kafka] Lỗi xử lý message:", parseError);
        }
      },
    });
  } catch (error) {
    console.error("[Kafka] Lỗi kết nối Consumer:", error);
  }
};

export async function sendMessageToKafka(topic, messageData) {
  try {
    const messageString = JSON.stringify(messageData);

    const result = await producer({
      topic: topic,
      messages: [
        {
          value: messageString,
        },
      ],
    });

    return result;
  } catch (error) {
    throw new Error(`Lỗi khi bắn message vào Kafka: ${error.message}`);
  }
}
