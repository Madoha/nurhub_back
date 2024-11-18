const authentication = require('../middlewares/authMiddleware');
const { getProfile, getStreak } = require('../controllers/userController');
const { restrictTo } = require('../controllers/authController');
const ROLE_IDS = require('../config/roles');
const streakCheck = require('../middlewares/streakMiddleware');

const router = require('express').Router();

router.route('/:id')
    .get(authentication, restrictTo(ROLE_IDS.ADMIN, ROLE_IDS.TESTER), streakCheck, getProfile);

router.route('/:id/streak').get(getStreak)

module.exports = router;