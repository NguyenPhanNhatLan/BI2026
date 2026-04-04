import { Pool } from "pg";
import { sendMessageToKafka } from "./kafkaServices.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const startOutboxRelay = async () => {
  console.log("[Relay Worker] Khởi động luồng quét Outbox Events...");

  while (true) {
    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const { rows } = await client.query(`
        DELETE FROM outbox_events
        WHERE id IN (
          SELECT id FROM outbox_events
          ORDER BY id ASC
          LIMIT 50
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `);

      if (rows.length > 0) {
        for (const event of rows) {
          const payloadData = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

          await sendMessageToKafka("logistics_order_events", {
            aggregate_id: event.aggregate_id,
            aggregate_type: event.aggregate_type,
            eventType: event.event_type,
            payload: payloadData,
            timestamp: new Date().toISOString()
          });
          
          console.log(`[Relay Worker] Đã bắn sự kiện ${event.event_type} (Order: ${event.aggregate_id}) vào Kafka.`);
        }
      }

      await client.query("COMMIT");

      if (rows.length === 50) {
        await sleep(100); 
      } else {
        await sleep(2000); 
      }

    } catch (error) {
      if (client) await client.query("ROLLBACK");
      console.error("[Relay Worker] Lỗi xử lý outbox:", error.message);
      await sleep(3000); 
    } finally {
      if (client) client.release();
    }
  }
};