const multer = require('multer');
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

const upload = multer({ storage: multer.memoryStorage() });

router
  .route('/send-email')
  .post(upload.single('reservation'), emailController.sendEmail);

module.exports = router;
