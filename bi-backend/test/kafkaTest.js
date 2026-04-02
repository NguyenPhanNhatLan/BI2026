import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'test-producer', brokers: ['100.117.178.115:9092'] });
const producer = kafka.producer();

const run = async () => {
  await producer.connect();
  const randomQty = Math.floor(Math.random() * 20) + 70; 
  const orderId = `FAP${Date.now().toString().slice(-6)}`;
  
  await producer.send({
    topic: 'logistics_order_events',
    messages: [
      {
        value: JSON.stringify({
          eventType: 'ORDER_DELIVERED',
          payload: {
            order_id: orderId,
            order_qty: 100, 
            delivery_qty: randomQty, 
            price: 100, 
            note: "Hàng gặp sự cố trên đường đi. Ký nhận thiếu."
          }
        }),
      },
    ],
  });

  console.log(`[Producer] Đã bắn sự kiện lỗi In-Full cho đơn ${orderId} vào Kafka!`);
  await producer.disconnect();
};
