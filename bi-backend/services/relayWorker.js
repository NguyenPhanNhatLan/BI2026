import { Pool } from "pg";
import { sendMessageToKafka } from "./kafkaServices.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const startOutboxRelay = () => {
  console.log("[Relay Worker] Khởi động luồng quét Outbox Events...");

  setInterval(async () => {
    const client = await pool.connect();
    
    try {
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
          await sendMessageToKafka("logistics_order_events", {
            aggregate_id: event.aggregate_id,
            aggregate_type: event.aggregate_type,
            eventType: event.event_type,
            payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload,
            timestamp: new Date().toISOString()
          });
          
          console.log(`[Relay Worker] Đã bắn sự kiện ${event.event_type} (Order: ${event.aggregate_id}) vào Kafka.`);
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("[Relay Worker] Lỗi xử lý outbox:", error.message);
    } finally {
      client.release();
    }
  }, 2000);
};