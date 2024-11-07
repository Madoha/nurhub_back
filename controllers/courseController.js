const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const courseModule = require('../db/models/coursemodule');
const course = require('../db/models/course');
const lesson = require('../db/models/lesson');
const test = require('../db/models/test');

const create = catchAsync(async (req, res, next) => {
    const newCourse = course.create(req.body);
    return res.status(201).json(newCourse);
});


const getWith = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    const currentCourse = await course.findByPk(courseId, {
        include: [
            {
                model: courseModule,
                as: 'courseModules',
                all: true,
                nested: true
            }
        ]
    });
    if (!currentCourse) throw new AppError('course not found', 404);
    return res.json(currentCourse);
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
    const currentModule = await courseModule.findByPk(req.params.moduleId);
    if (!currentModule) throw new AppError('module not found');

    const tests = await test.bulkCreate(req.body.map(test => ({
        ...test,
        moduleId: req.params.moduleId
    })));

    return res.status(201).json(tests);
});

module.exports = { create, getWith, update, deleted, addModules, addLessons, addTests };