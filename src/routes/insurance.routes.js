const router = require('express').Router();
const {
  getAllApplications,
  getInsuranceQuotes,
  finalizeInsurance,
  createNationalities,
  getNationalities,
  getInsuranceApplication,
  downloadInsurancePolicy,
} = require('../controllers/insurance.controller');

router.route('/').get(getAllApplications)
router.route('/quote').post(getInsuranceQuotes);
router.route('/finalize').post(finalizeInsurance);
router.route('/nationalities').post(createNationalities);
router.route('/nationalities').get(getNationalities);
router.route('/download/:policyId/:index').get(downloadInsurancePolicy);
router.route('/:sessionId').get(getInsuranceApplication);

module.exports = router;
