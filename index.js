import "dotenv/config";
import express from "express";
import connectDB from "./src/DB/Config.js";
import authRouter from "./src/modules/Auth/auth.route.js";
import reviewsRouter from "./src/modules/Reviews/reviews.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bookingRouter from "./src/modules/Booking/booking.route.js";
import viewingRouter from "./src/modules/Viewing/viewing.route.js";
import propertyRouter from "./src/modules/Property/property.route.js";
import userRouter from "./src/modules/User/user.route.js";
import paymentRoutes from "./src/modules/Payment/payment.route.js";


const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/viewing", viewingRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/payment", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const statusCode = err.cause || 500;
  res.status(statusCode).json({ message: err.message });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
