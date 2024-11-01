const authentication = require('../middlewares/authMiddleware');
const { getProfile } = require('../controllers/userController');
const { restrictTo } = require('../controllers/authController');
const ROLE_IDS = require('../config/roles');

const router = require('express').Router();

router.route('/:id')
    .get(authentication, restrictTo(ROLE_IDS.TESTER), getProfile);

module.exports = router;