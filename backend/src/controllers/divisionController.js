const Division = require('../models/Division');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');

exports.list = async (req, res, next) => {
  try {
    const divisions = await Division.find().sort({ name: 1 });
    res.json(divisions);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const division = await Division.create(req.body);
    res.status(201).json(division);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const division = await Division.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!division) return res.status(404).json({ message: 'Division not found' });
    res.json(division);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const used = await Subject.exists({ division: req.params.id });
    if (used) {
      return res.status(400).json({
        message: 'Cannot delete division because subjects are still assigned to it.'
      });
    }
    await Timetable.deleteMany({ division: req.params.id });
    const division = await Division.findByIdAndDelete(req.params.id);
    if (!division) return res.status(404).json({ message: 'Division not found' });
    res.json({ message: 'Division deleted' });
  } catch (err) {
    next(err);
  }
};
