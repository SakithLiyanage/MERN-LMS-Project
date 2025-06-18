const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    graded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachments: [{
      type: String
    }],
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    totalPoints: {
      type: Number,
      required: [true, 'Total points is required'],
      min: [0, 'Total points cannot be negative'],
    },
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
