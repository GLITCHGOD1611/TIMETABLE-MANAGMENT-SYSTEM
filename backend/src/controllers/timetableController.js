const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Division = require('../models/Division');
const { generateTimetable } = require('../services/timetableGenerator');
const { findConflict, countSubjectLectures } = require('../services/constraints');

const populateFields = [
  { path: 'division', select: 'name department year semester studentCount' },
  { path: 'subject', select: 'name code type lecturesPerWeek' },
  { path: 'teacher', select: 'name email department availability' },
  { path: 'classroom', select: 'roomNumber capacity type unavailableSlots' }
];

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const entries = await Timetable.find(filter)
      .populate(populateFields)
      .sort({ day: 1, period: 1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

exports.generate = async (req, res, next) => {
  try {
    const result = await generateTimetable();
    const entries = await Timetable.find()
      .populate(populateFields)
      .sort({ day: 1, period: 1 });
    res.json({
      message: `Timetable generated successfully with ${result.count} lectures.`,
      entries
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCell = async (req, res, next) => {
  try {
    const { subject: subjectId, teacher: teacherId, classroom: classroomId } = req.body;
    const entry = await Timetable.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timetable entry not found' });

    const [subject, teacher, classroom, division, allEntries] = await Promise.all([
      Subject.findById(subjectId),
      Teacher.findById(teacherId),
      Classroom.findById(classroomId),
      Division.findById(entry.division),
      Timetable.find()
        .populate('division', 'name')
        .populate('teacher', 'name')
        .populate('classroom', 'roomNumber')
    ]);

    if (!subject) return res.status(400).json({ message: 'Subject not found' });
    if (!teacher) return res.status(400).json({ message: 'Teacher not found' });
    if (!classroom) return res.status(400).json({ message: 'Classroom not found' });

    if (String(subject.division) !== String(entry.division)) {
      return res.status(400).json({
        message: `${subject.name} is not assigned to this division.`
      });
    }

    if (String(subject.teacher) !== String(teacher._id)) {
      return res.status(400).json({
        message: `${subject.name} is assigned to a different teacher. Select the correct teacher for this subject.`
      });
    }

    const existingCount = countSubjectLectures(allEntries, subject._id, entry._id);
    if (existingCount >= subject.lecturesPerWeek) {
      const currentSubjectId = String(entry.subject);
      if (currentSubjectId !== String(subject._id)) {
        return res.status(400).json({
          message: `Cannot assign ${subject.name} because it already has ${subject.lecturesPerWeek} lectures this week.`
        });
      }
    }

    const conflict = findConflict(
      allEntries,
      {
        day: entry.day,
        period: entry.period,
        teacher: teacher._id,
        classroom: classroom._id,
        division: entry.division,
        ignoreId: entry._id
      },
      { teacher, classroom, division, subject }
    );

    if (conflict) {
      return res.status(409).json({ message: conflict });
    }

    entry.subject = subject._id;
    entry.teacher = teacher._id;
    entry.classroom = classroom._id;
    await entry.save();

    const updated = await Timetable.findById(entry._id).populate(populateFields);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.clear = async (req, res, next) => {
  try {
    await Timetable.deleteMany({});
    res.json({ message: 'Timetable cleared' });
  } catch (err) {
    next(err);
  }
};
