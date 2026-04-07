import { Client } from 'pg';
import kafka from '../config/kafkaClient.js';

const pg = new Client({ connectionString: process.env.DATABASE_URL });
const producer = kafka.producer();

let isProcessing = false; 

export const startOutboxRelay = async () => {
  try {
    await pg.connect();
    await producer.connect();
    console.log("[Outbox] Đã kết nối Postgres & Kafka Producer");

    setInterval(async () => {
      if (isProcessing) return; 
      isProcessing = true;

      try {
        await pg.query('BEGIN');

        const res = await pg.query(`
          SELECT * FROM outbox_events 
          WHERE processed = false 
          ORDER BY created_at ASC 
          LIMIT 100
          FOR UPDATE SKIP LOCKED
        `);

        if (res.rows.length === 0) {
          await pg.query('ROLLBACK');
          return;
        }

        const messages = res.rows.map(row => ({
          key: row.aggregate_id,
          value: JSON.stringify({
            eventType: row.event_type,
            tableName: row.aggregate_type,
            payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
            timestamp: row.created_at
          })
        }));

        await producer.send({
          topic: 'orders_topic',
          messages,
        });

        const ids = res.rows.map(row => row.id);
        await pg.query(
          'UPDATE outbox_events SET processed = true WHERE id = ANY($1)',
          [ids]
        );

        await pg.query('COMMIT'); 
        console.log(`[Outbox] Đã đẩy ${messages.length} tin nhắn lên Kafka.`);

      } catch (err) {
        await pg.query('ROLLBACK'); 
        console.error("[Outbox Loop Error]", err.message);
      } finally {
        isProcessing = false; 
      }
    }, 10);

  } catch (error) {
    console.error("[Outbox Critical Error]", error);
  }
};