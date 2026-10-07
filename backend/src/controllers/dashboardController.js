const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Division = require('../models/Division');
const Classroom = require('../models/Classroom');
const TimeSlot = require('../models/TimeSlot');
const Timetable = require('../models/Timetable');

exports.summary = async (req, res, next) => {
  try {
    const [teachers, subjects, divisions, classrooms, timeSlots, lectures] = await Promise.all([
      Teacher.countDocuments(),
      Subject.countDocuments(),
      Division.countDocuments(),
      Classroom.countDocuments(),
      TimeSlot.countDocuments(),
      Timetable.countDocuments()
    ]);

    const requiredLectures = await Subject.aggregate([
      { $group: { _id: null, total: { $sum: '$lecturesPerWeek' } } }
    ]);

    res.json({
      teachers,
      subjects,
      divisions,
      classrooms,
      timeSlots,
      lectures,
      requiredLectures: requiredLectures[0]?.total || 0
    });
  } catch (err) {
    next(err);
  }
};
