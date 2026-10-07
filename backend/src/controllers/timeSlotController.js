const TimeSlot = require('../models/TimeSlot');

exports.list = async (req, res, next) => {
  try {
    const slots = await TimeSlot.find().sort({ day: 1, period: 1 });
    res.json(slots);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const slot = await TimeSlot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const slot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    res.json(slot);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const slot = await TimeSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    res.json({ message: 'Time slot deleted' });
  } catch (err) {
    next(err);
  }
};

exports.replaceWeek = async (req, res, next) => {
  try {
    const { periods } = req.body;
    if (!Array.isArray(periods) || !periods.length) {
      return res.status(400).json({ message: 'periods array is required' });
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const docs = [];
    for (const day of days) {
      for (const period of periods) {
        docs.push({
          day,
          period: period.period,
          startTime: period.startTime,
          endTime: period.endTime
        });
      }
    }

    await TimeSlot.deleteMany({});
    const created = await TimeSlot.insertMany(docs);
    res.json(created);
  } catch (err) {
    next(err);
  }
};
