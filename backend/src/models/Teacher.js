const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true
    },
    period: { type: Number, required: true, min: 1 },
    available: { type: Boolean, default: true }
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    availability: { type: [availabilitySchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
