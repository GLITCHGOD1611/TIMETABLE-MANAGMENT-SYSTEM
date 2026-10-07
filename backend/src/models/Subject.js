const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
    lecturesPerWeek: { type: Number, required: true, min: 1, max: 10 },
    type: { type: String, enum: ['Theory', 'Practical'], required: true }
  },
  { timestamps: true }
);

subjectSchema.index({ code: 1, division: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
