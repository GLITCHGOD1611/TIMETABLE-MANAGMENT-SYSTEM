const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true
    },
    period: { type: Number, required: true, min: 1 },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true }
  },
  { timestamps: true }
);

timetableSchema.index({ division: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
