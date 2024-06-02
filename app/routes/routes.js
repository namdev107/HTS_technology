'use strict';

const express = require('express');
const router = express.Router();
const userDetails = require('../controller/userDetails.controller');
const authenticateToken = require('../middleware/validation');

router.post('/signup', userDetails.registerUser);
router.post('/signin', userDetails.signIn);
router.get('/getUserDetails', authenticateToken, userDetails.userDetails);

module.exports = router;




