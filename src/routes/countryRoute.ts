import express from 'express';
import countryController from '../controllers/countryCtrl';
import authorizeRole, { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/migrate', authenticateToken, authorizeRole(['admin']), countryController.migrateDatatoDB);
router.get('/countries', authenticateToken, countryController.fetchAllCountries); // needs modification to return info by both the filter and the fields if provided
router.get('/countries/:code', authenticateToken, countryController.fetchCountryDetails);
router.get('/regions', authenticateToken, countryController.getRegions);
router.get('/languages', authenticateToken, countryController.getLanguages);
router.get('/statistics', authenticateToken, countryController.getStatistics);

export default router;