import { Router } from 'express';
import { buyHero } from '../controllers/transactionController';

const router = Router();

// Rute untuk transaksi pembelian
router.post('/buy', buyHero);

export default router;