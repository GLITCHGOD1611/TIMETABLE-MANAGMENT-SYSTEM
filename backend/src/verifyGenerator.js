require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { generateTimetable } = require('./services/timetableGenerator');
const Timetable = require('./models/Timetable');
const Subject = require('./models/Subject');
const { isTeacherAvailable, isClassroomAvailable } = require('./services/constraints');

async function verify() {
  await connectDB();
  const result = await generateTimetable();
  const entries = await Timetable.find()
    .populate('teacher')
    .populate('classroom')
    .populate('division')
    .populate('subject');

  const keys = { teacher: new Set(), classroom: new Set(), division: new Set() };
  for (const e of entries) {
    const t = `${e.teacher._id}|${e.day}|${e.period}`;
    const c = `${e.classroom._id}|${e.day}|${e.period}`;
    const d = `${e.division._id}|${e.day}|${e.period}`;
    if (keys.teacher.has(t)) throw new Error(`Teacher conflict: ${e.teacher.name} ${e.day} P${e.period}`);
    if (keys.classroom.has(c)) throw new Error(`Classroom conflict: ${e.classroom.roomNumber} ${e.day} P${e.period}`);
    if (keys.division.has(d)) throw new Error(`Division conflict: ${e.division.name} ${e.day} P${e.period}`);
    keys.teacher.add(t);
    keys.classroom.add(c);
    keys.division.add(d);

    if (!isTeacherAvailable(e.teacher, e.day, e.period)) {
      throw new Error(`Unavailable teacher assigned: ${e.teacher.name} ${e.day} P${e.period}`);
    }
    if (!isClassroomAvailable(e.classroom, e.day, e.period)) {
      throw new Error(`Unavailable classroom assigned: ${e.classroom.roomNumber}`);
    }
  }

  const subjects = await Subject.find();
  for (const subject of subjects) {
    const count = entries.filter((e) => String(e.subject._id) === String(subject._id)).length;
    if (count !== subject.lecturesPerWeek) {
      throw new Error(`${subject.name} expected ${subject.lecturesPerWeek} lectures, got ${count}`);
    }
  }

  console.log(`Generated ${result.count} lectures`);
  console.log('Constraint verification passed');
  await mongoose.disconnect();
}

verify().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
