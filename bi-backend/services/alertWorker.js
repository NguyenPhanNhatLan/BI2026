import kafka from "../config/kafkaClient.js";


const consumer = kafka.consumer({ groupId: "alert-group" });

export const initAlertWorker = async (io) => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "orders_topic", fromBeginning: false });

    console.log("[Alert] Worker is running and waiting for messages...");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          const { eventType, payload } = event;

          if (
            eventType === "ORDER_DELIVERED" && 
            payload?.delivery_qty < payload?.order_qty
          ) {
            const lostRevenue = (payload.order_qty - payload.delivery_qty) * (payload.price || 0);

            io.emit("OPERATIONAL_ALERT", {
              level: "CRITICAL",
              type: "IN_FULL_FAILURE",
              order_id: payload.id,
              message: `Cảnh báo: Đơn hàng ${payload.id} giao thiếu! Hụt $${lostRevenue.toLocaleString()} doanh thu.`
            });
            
            console.log(`[Alert] Đã phát hiện và báo cáo đơn hàng thiếu: ${payload.id}`);
          }
        } catch (e) {
          console.error("[Alert Parse Error]", e.message);
        }
      },
    });
  } catch (error) {
    console.error("[Alert Critical Error]", error);
  }
};