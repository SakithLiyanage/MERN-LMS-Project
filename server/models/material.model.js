const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
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
    type: {
      type: String,
      enum: ['pdf', 'image', 'video', 'link', 'document', 'other'],
      required: [true, 'Material type is required'],
    },
    file: {
      type: String,
      default: null,
    },
    link: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
