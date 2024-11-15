const { create, getWith, update, deleted, addModules, addLessons, addTests, addQuestionsAndAnswers } = require('../controllers/courseController');
const authentication = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.route('/').post(create);
router.route('/:id').get(getWith)
    .put(update)
    .delete(deleted);
router.route('/:id/modules').post(addModules);
router.route('/:courseId/modules/:moduleId/lessons').post(addLessons);
router.route('/:courseId/modules/:moduleId/tests').post(addTests);
router.route('/:courseId/modules/:moduleId/test/:testId').post(addQuestionsAndAnswers)

module.exports = router;