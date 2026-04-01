import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import customerRouter from "./routes/customerRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { setupSwagger } from "./swagger/index.js";
import productRouter from "./routes/productRoutes.js";
import { startKafkaConsumer } from "./services/kafkaServices.js";
import EventRouter from "./routes/kafkaRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("socketio", io);
app.use("/customers", customerRouter);
app.use("/orders", orderRouter);
app.use("/products", productRouter)
app.use("/events", EventRouter);
app.use("/dashboard", dashboardRouter);



app.get("/", (req, res) => {
  res.send("API is running...");
});

setupSwagger(app);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


app.use((err, req, res, next) => {
  console.error("[Global Error]:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  await startKafkaConsumer();
  
});

export { io };