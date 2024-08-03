import express from 'express';
import countryController from '../controllers/countryCtrl';

const router = express.Router();

// router.post('/savetodb', countryController.fetchAndSaveCountryToDB);
router.post('/migrate', countryController.migrateDatatoDB);
router.get('/countries', countryController.fetchAllCountries);
router.get('/countries/:code', countryController.fetchCountryDetails);
router.get('/regions', countryController.getRegions);
router.get('/languages', countryController.getLanguages);
router.get('/statistics', countryController.getStatistics);

export default router;