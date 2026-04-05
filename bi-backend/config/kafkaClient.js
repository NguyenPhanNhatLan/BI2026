import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "bi-backend",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

export default kafka;