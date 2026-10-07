const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true
    },
    period: { type: Number, required: true, min: 1 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  { timestamps: true }
);

timeSlotSchema.index({ day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
