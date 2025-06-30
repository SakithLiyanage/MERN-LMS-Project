const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      // Make it optional to avoid validation errors
      maxlength: [20, 'Course code cannot be more than 20 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: 'default-course.jpg',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    materials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    enrollmentKey: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create slug from title
CourseSchema.pre('save', function (next) {
  // Only run if code is not provided and title has changed
  if (!this.code && (this.isNew || this.isModified('title'))) {
    // Generate a simple code from title
    this.code = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .substr(0, 20);
  }
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
