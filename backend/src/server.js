
import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import connectDB from "./config/db.js";
import cors from "cors";
import hotelRoutes from "./routes/hotelRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use("/hotels", hotelRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Hotel Management System Backend Running");
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
};

startServer();
