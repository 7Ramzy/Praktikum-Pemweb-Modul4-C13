import { Router } from 'express';
import {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  getPlayerStats
} from '../controllers/playerController';

const router = Router();

// Rute Statistik (Wajib di atas :id)
router.get('/stats', getPlayerStats);

// Rute CRUD Utama
router.post('/', createPlayer);
router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.put('/:id', updatePlayer);
router.delete('/:id', deletePlayer);

export default router;