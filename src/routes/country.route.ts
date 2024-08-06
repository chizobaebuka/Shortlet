import express from 'express';
import countryController from '../controllers/countryCtrl';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.post('/migrate', authenticateToken, authorizeRole(['admin']), countryController.migrateDatatoDB);
router.get('/countries', authenticateToken, countryController.fetchAllCountries); 
router.get('/countries/:code', authenticateToken, countryController.fetchCountryDetails);
router.get('/regions', authenticateToken, countryController.getRegions);
router.get('/languages', authenticateToken, countryController.getLanguages);
router.get('/statistics', authenticateToken, countryController.getStatistics);

export default router;