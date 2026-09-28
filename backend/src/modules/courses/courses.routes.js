import express from 'express';
import { searchCourses, enrollInCourse, getCourseById } from './courses.controller.js';

const router = express.Router();

router.get('/search', searchCourses);
router.post('/enroll', enrollInCourse);
router.get('/:id', getCourseById);

export default router;
