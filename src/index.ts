import "dotenv/config";
import express from "express";
import { logger } from "./middlewares/logger";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import heroRoutes from "./routes/hero";
import skinRoutes from "./routes/skin";
import playerRoutes from "./routes/player";
import statisticRoutes from "./routes/statistic";

const app = express();

app.use(express.json());
app.use(logger);

app.get("/health", (_req, res) => {
  res.json({ status: true, message: "MLBB Shop API berjalan dengan baik" });
});

app.use("/api/heroes", heroRoutes);
app.use("/api/skins", skinRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/statistics", statisticRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));