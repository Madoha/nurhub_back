const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const courseModule = require('../db/models/coursemodule');
const course = require('../db/models/course');
const lesson = require('../db/models/lesson');
const test = require('../db/models/test');
const sequelize = require('../config/database');
const question = require('../db/models/question');
const answer = require('../db/models/answer');

const create = catchAsync(async (req, res, next) => {
    const newCourse = course.create(req.body);
    return res.status(201).json(newCourse);
});

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
        moduleId: req.params.moduleId
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

module.exports = { create, getWith, update, deleted, addModules, addLessons, addTests, addQuestionsAndAnswers };