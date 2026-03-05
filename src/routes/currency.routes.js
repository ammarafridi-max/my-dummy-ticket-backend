const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currency.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router
  .route('/')
  .get(currencyController.getCurrencies)
  .post(protect, restrictTo('admin', 'agent'), currencyController.createCurrency);

router
  .route('/:code')
  .get(currencyController.getCurrencyByCode)
  .put(protect, restrictTo('admin', 'agent'), currencyController.updateCurrency)
  .delete(protect, restrictTo('admin', 'agent'), currencyController.deleteCurrency);

module.exports = router;
