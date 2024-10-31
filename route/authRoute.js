const { signup, login, authentication, forgotPassword, resetPassword, changePassword } = require('../controllers/authController'); 

const router = require('express').Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);
router.route('/change-password').post(authentication, changePassword);

module.exports = router;