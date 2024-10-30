const { authentication } = require('../controllers/authController');
const { getProfile } = require('../controllers/userController');

const router = require('express').Router();

router.route('/:id')
    .get(authentication, getProfile);

module.exports = router;