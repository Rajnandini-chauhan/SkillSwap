import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  channel: {
    type: String,
  },
  youtubeVideoId: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
