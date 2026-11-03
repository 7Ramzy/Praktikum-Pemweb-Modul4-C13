import { Router } from 'express';
import { getAllHeroes, createHero, createSkin } from '../controllers/heroController';

const router = Router();

// Rute untuk Hero
router.get('/', getAllHeroes);
router.post('/', createHero);

// Rute untuk menambah Skin (karena Skin terikat dengan Hero)
router.post('/skin', createSkin);

export default router;