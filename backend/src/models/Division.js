const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    studentCount: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Division', divisionSchema);
