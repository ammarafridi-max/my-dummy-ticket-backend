require('dotenv').config();
const express = require('express');
const { createRole } = require('../controllers/role.controller');
const router = express.Router();

router.route('/').get().post(createRole);
router.route('/:slug').get().put().delete();

module.exports = router;
