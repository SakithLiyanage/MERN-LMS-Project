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
  type: {
    type: String,
    enum: ['single', 'multiple', 'text'],
    default: 'single',
  },
  options: {
    type: [optionSchema],
    required: function() {
      return this.type !== 'text';
    },
    validate: {
      validator: function(options) {
        if (this.type !== 'text') {
          return options && options.length >= 2;
        }
        return true;
      },
      message: 'Questions must have at least 2 options'
    }
  },
  correctTextAnswers: {
    type: [{
      type: String,
      trim: true,
    }],
    required: function() {
      return this.type === 'text';
    },
    validate: {
      validator: function(answers) {
        if (this.type === 'text') {
          return answers && answers.length > 0 && answers.every(ans => ans.trim().length > 0);
        }
        return true;
      },
      message: 'Text questions must have at least one correct answer'
    }
  },
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
      selectedOptions: [{
        type: mongoose.Schema.Types.ObjectId,
      }],
      textAnswer: {
        type: String,
        trim: true,
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
  timeTaken: {
    type: Number, // Time in seconds
    default: null,
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
