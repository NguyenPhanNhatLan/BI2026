import  { Client } from 'pg';
import kafka from '../config/kafkaClient.js';

const pg = new Client({ connectionString: process.env.DATABASE_URL });
const producer = kafka.producer();

export const startOutboxRelay = async () => {
  try {
    await pg.connect();
    await producer.connect();
    console.log("[Outbox] Đã kết nối Postgres & Kafka Producer");

    // Quét DB mỗi 2 giây
    setInterval(async () => {
      try {
        const res = await pg.query(`
          SELECT * FROM outbox_events 
          WHERE processed = false 
          ORDER BY created_at ASC 
          LIMIT 100
        `);

        if (res.rows.length === 0) return;


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
          messages: messages,
        });


        const ids = res.rows.map(row => row.id);
        await pg.query('UPDATE outbox_events SET processed = true WHERE id = ANY($1)', [ids]);
        
        console.log(`[Outbox] Đã đẩy ${messages.length} tin nhắn lên Kafka.`);
      } catch (err) {
        console.error("[Outbox Loop Error]", err.message);
      }
    }, 2000);

  } catch (error) {
    console.error("[Outbox Critical Error]", error);
  }
};