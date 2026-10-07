const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const subjects = await Subject.find(filter)
      .populate('teacher', 'name email department')
      .populate('division', 'name year semester')
      .sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    const populated = await subject.populate([
      { path: 'teacher', select: 'name email department' },
      { path: 'division', select: 'name year semester' }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('teacher', 'name email department').populate('division', 'name year semester');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Timetable.deleteMany({ subject: req.params.id });
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};
