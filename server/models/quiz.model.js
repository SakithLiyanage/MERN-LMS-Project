const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [optionSchema],
  points: {
    type: Number,
    required: true,
    default: 1,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const studentResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  totalPossibleScore: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
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
    timeLimit: {
      type: Number, // In minutes
      default: null,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableTo: {
      type: Date,
      default: null,
    },
    questions: [questionSchema],
    results: [studentResultSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
