const mongoose = require('mongoose');

const unavailableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true
    },
    period: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const classroomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ['Theory', 'Lab'], required: true },
    unavailableSlots: { type: [unavailableSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classroom', classroomSchema);
