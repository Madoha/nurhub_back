const { signup, login, logout, refreshToken, forgotPassword, resetPassword, changePassword } = require('../controllers/authController'); 
const authentication = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(authentication, logout);
router.route('/refresh').get(refreshToken);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);
router.route('/change-password').post(authentication, changePassword);

module.exports = router;