const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const courseModule = require('../db/models/coursemodule');
const course = require('../db/models/course');
const lesson = require('../db/models/lesson');
const test = require('../db/models/test');
const sequelize = require('../config/database');
const question = require('../db/models/question');
const answer = require('../db/models/answer');
const userCourseProgress = require('../db/models/usercourseprogress');
const certificate = require('../db/models/certificate');

const create = catchAsync(async (req, res, next) => {
    const newCourse = course.create(req.body);
    return res.status(201).json(newCourse);
});

const getAllCourses = catchAsync(async (req, res, next) => {
    const courses = await course.findAll();
    res.json({
        success:true,
        courses
    })
})

const getWith = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) {
        return next(new AppError('Course not found', 404));
    }

    const courseModules = await courseModule.findAll({where: {courseId: courseId}});
    
    const modulesWithLessons = await Promise.all(
        courseModules.map(async (curModule) => {
            const moduleLessons = await lesson.findAll({where: { courseModuleId: curModule.id }});
            return { ...curModule.dataValues, lessons: moduleLessons.map((lesson) => lesson.dataValues) }
        })
    );

    const response = {
        ...currentCourse.dataValues,
        modules: modulesWithLessons
    };

    return res.json(response);
});

const update = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    const [updated] = await course.update(req.body, { where: { id: courseId } });
    if (!updated) throw new AppError('course not found', 404);
    const updatedCourse = await course.findByPk(courseId);
    return res.json(updatedCourse);
});

const deleted = catchAsync(async (req, res, next) => {
    const deletedCourse = await course.destroy({where: { id: req.params.id }});
    if (!deletedCourse) throw new AppError('course not found', 404);
    return res.json({message: 'course deleted'});
});

const addModules = catchAsync(async (req, res, next) => {
    const currentCourse = await course.findByPk(req.params.id);
    if (!currentCourse) throw new AppError('course not found');

    const modules = await courseModule.bulkCreate(req.body.map(module => ({
        ...module,
        courseId: req.params.id
    })));

    return res.status(201).json(modules);
});

const addLessons = catchAsync(async (req, res, next) => {
    const currentModule = await courseModule.findByPk(req.params.moduleId);
    if (!currentModule) throw new AppError('module not found');

    const lessons = await lesson.bulkCreate(req.body.map(lesson => ({
        ...lesson,
        courseModuleId: req.params.moduleId
    })));

    return res.status(201).json(lessons);
});

const addTests = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) throw new AppError('course not found');

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId}});
    if (!currentModule) {
        return next(new AppError('Module not found in the specified course', 404));
    }
    console.log('addTests body', req.body)
    
    const tests = await test.create({
        ...req.body,
        courseModuleId: moduleId
    });
    // const tests = await test.bulkCreate(req.body.map(test => ({
    //     ...test,
    //     courseModuleId: moduleId
    // })));

    return res.status(201).json(tests);
});

const addQuestionsAndAnswers = catchAsync(async (req, res, next) => {
    const { courseId, moduleId, testId } = req.params;
    const questions = req.body;
    console.log('questions', req.body);

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId }});
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    const currentTest = await test.findOne({where: { id: testId, courseModuleId: moduleId }})
    if (!currentTest) return next(new AppError('Test not found in the specified module', 404));

    const transaction = await sequelize.transaction();

    try {
        for(const questionData of questions) {
            const { text, answers } = questionData;

            const createdQuestion = await question.create(
                {
                    text,
                    testId: currentTest.id
                },
                { transaction }
            );

            const answerToCreate = answers.map((questionAnswers) => ({
                ...questionAnswers,
                questionId: createdQuestion.id
            }));

            await answer.bulkCreate(answerToCreate, { transaction })
        }

        await transaction.commit();

        res.status(201).json({ success: true, message: 'Questions and answers added successfully' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

const getModuleTests = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId }});
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    const currentTests = await test.findAll({
        where: { courseModuleId: moduleId }
    });

    if (!currentTests || currentTests.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No tests found for this module',
            tests: []
        });
    }

    const testsWithDetails = [];
    for (const currentTest of currentTests) {
        const testQuestions = await question.findAll({where: { testId: currentTest.id }});

        const questionWithAnswers = [];
        for (const testQuestion of testQuestions) {
            const questionAnswers = await answer.findAll({
                where: { questionId: testQuestion.id }
            });

            questionWithAnswers.push({
                id: testQuestion.id,
                text: testQuestion.text,
                answers: questionAnswers
            });
        }

        testsWithDetails.push({
            id: currentTest.id,
            type: currentTest.type,
            questions: questionWithAnswers
        });
    }

    res.json({
        success: true,
        message: 'Tests retrieved successfully',
        tests: testsWithDetails
    });
});

const getStarted = catchAsync(async (req, res, next) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Course not found', 404));

    // todo achievements

    await userCourseProgress.create({
        userId,
        courseId
    });

    return res.status(200);
});

const getUserCourses = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const allCourses = await userCourseProgress.findAll({where: { userId }});

    return res.json({
        success: true,
        data: allCourses
    });
});

const updateProgress = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;
    const userId = req.user.id;
    const { testScore } = req.body;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Course not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId }});
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    const progress = await userCourseProgress.findOne({where: { userId, courseId }});

    if (!progress) {
        throw new AppError('Прогресс по курсу не найден', 404);
    }

    if (progress.completedModules.include(moduleId)){
        return res.json({success: true, message: 'already completed'});
    }

    progress.completedModules.push(moduleId);
    progress.score += testScore;

    let coinsBonus = req.userStreak >= 5 ? 5 : 0;

    // if (testScore >= 80) { } 
    progress.coinsEarned += (1 + coinsBonus);

    if (progress.completedModules.length === progress.totalModules) {
        progress.coinsEarned += 5;
    }

    await progress.save();
    return res.json({success: true, message: 'progress updated'})
});

const completeCourse = catchAsync(async (req, res, next) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const progress = await progress.findOne({where: { courseId, userId }});

    if (!progress) return next(new AppError('please start the course and complete all modules', 400));

    if (progress.completedModules.length !== progress.totalModules) return next(new AppError('not allowed', 400));

    // todo coins course migrations
    const userScore = progress.score;
    const allScoreCount = await getMaxScoreForCourse(courseId);
    const leastScore = allScoreCount * 0.8;
    const coinsEarned = progress.coinsEarned;
    user.coins += coinsEarned;
    if (!(userScore >= leastScore)){
        throw new AppError('Ваша средняя оценка меньше 80 процентов, у вас нет прав закончить курс', 400); 
    }

    const result = await certificate.create({
        score: userScore,
        userId: userId,
        courseId: courseId
    });

    await user.save();
    return res.json({status: true, score: result.score, coins: coinsEarned})
});

const getMaxScoreForCourse = async (courseId) => {
    const query = `
        SELECT COUNT(q.id) AS totalQuestions
        FROM questions q
        JOIN tests t ON q.testId = t.id
        JOIN courseModules cm ON t.courseModuleId = cm.id
        WHERE cm.courseId = :courseId
    `;

    const result = await sequelize.query(query, {
        replacements: { courseId },
        type: sequelize.QueryTypes.SELECT,
      });

      return result[0].totalQuestions;
}

module.exports = { 
    create, 
    getWith,
    update, 
    deleted, 
    addModules, 
    addLessons, 
    addTests, 
    addQuestionsAndAnswers, 
    getModuleTests, 
    getAllCourses, 
    updateProgress, 
    completeCourse, 
    getStarted, 
    getUserCourses 
};