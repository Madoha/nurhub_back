const { testACh, create, getWith, update, deleted, addModules, addLessons, addTests, addQuestionsAndAnswers, getModuleTests, getAllCourses, updateProgress, completeCourse, getStarted, openQuestionAnswerCheck } = require('../controllers/courseController');
const authentication = require('../middlewares/authMiddleware');
const streakCheck = require('../middlewares/streakMiddleware');

const router = require('express').Router();

// test socket io
router.route('/test').get(testACh);

router.route('/')
    .post(create)
    .get(getAllCourses);

router.route('/:id').get(getWith)
    .put(update)
    .delete(deleted);

router.route('/:id/start').get(authentication, getStarted);

router.route('/:id/modules').post(addModules);

router.route('/:courseId/modules/:moduleId/lessons').post(addLessons);

router.route('/:courseId/modules/:moduleId/tests')
    .post(addTests)
    .get(getModuleTests);

router.route('/:courseId/modules/:moduleId/test/:testId').post(addQuestionsAndAnswers);

router.route('/:courseId/modules/:moduleId/complete').post(authentication, streakCheck, updateProgress);
router.route('/:courseId/complete').get(authentication, streakCheck, completeCourse);

router.route('/:courseId/modules/:moduleId/test/:testId/question/:questionId').post(openQuestionAnswerCheck);

module.exports = router;