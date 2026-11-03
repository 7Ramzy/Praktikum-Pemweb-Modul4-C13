import express from 'express';
import cors from 'cors';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import playerRoutes from './routes/playerRoutes';
import heroRoutes from './routes/heroRoutes';
import transactionRoutes from './routes/transactionRoutes';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

// Mendaftarkan Rute Utama
app.use('/api/players', playerRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/error-test', (req, res, next) => {
  next(new Error('Ini adalah pesan error percobaan!'));
});

// Error Handler (Wajib diletakkan paling bawah)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});