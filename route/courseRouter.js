const { create, getWith, update, deleted, addModules, addLessons, addTests } = require('../controllers/courseController');
const authentication = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.route('/').post(authentication, create);
router.route('/:id').get(authentication, getWith)
    .put(authentication, update)
    .delete(authentication, deleted);
router.route('/:id/modules').post(authentication, addModules);
router.route('/:courseId/modules/:moduleId/lessons').post(authentication, addLessons);
router.route('/:courseId/modules/:moduleId/tests').post(authentication, addTests);

module.exports = router;