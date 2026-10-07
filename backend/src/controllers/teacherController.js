const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');

exports.list = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().sort({ name: 1 });
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json(teacher);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const used = await Subject.exists({ teacher: req.params.id });
    if (used) {
      return res.status(400).json({
        message: 'Cannot delete teacher because one or more subjects are assigned to this teacher.'
      });
    }
    await Timetable.deleteMany({ teacher: req.params.id });
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    next(err);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'availability must be an array' });
    }
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true, runValidators: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};
