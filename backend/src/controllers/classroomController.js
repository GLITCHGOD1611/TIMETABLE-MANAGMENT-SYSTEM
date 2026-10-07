const Classroom = require('../models/Classroom');
const Timetable = require('../models/Timetable');

exports.list = async (req, res, next) => {
  try {
    const classrooms = await Classroom.find().sort({ roomNumber: 1 });
    res.json(classrooms);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const classroom = await Classroom.create(req.body);
    res.status(201).json(classroom);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json(classroom);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const used = await Timetable.exists({ classroom: req.params.id });
    if (used) {
      return res.status(400).json({
        message: 'Cannot delete classroom because it is used in the current timetable. Generate a new timetable after removing assignments, or pick another room.'
      });
    }
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json({ message: 'Classroom deleted' });
  } catch (err) {
    next(err);
  }
};
