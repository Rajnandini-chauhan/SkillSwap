import mongoose from 'mongoose';
import { coursesService } from './courses.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import Course from './courses.model.js';

export const searchCourses = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const results = await coursesService.searchVideos(q);

  res.status(200).json({
    success: true,
    data: results,
  });
});

export const enrollInCourse = asyncHandler(async (req, res) => {
  console.log('Enrollment Request Body:', req.body);
  const { videoId, title, channel, thumbnail, description } = req.body;

  if (!videoId) {
    console.log('Enrollment failed: No videoId found in body');
    throw new ApiError(400, 'Video ID is required for enrollment');
  }

  let course = await Course.findOne({ youtubeVideoId: videoId });

  if (!course) {
    course = await Course.create({
      title: title || 'Untitled Course',
      channel: channel || 'Unknown Channel',
      thumbnail: thumbnail || '',
      description: description || '',
      youtubeVideoId: videoId,
    });
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

export const getCourseById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');
  }

  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});
