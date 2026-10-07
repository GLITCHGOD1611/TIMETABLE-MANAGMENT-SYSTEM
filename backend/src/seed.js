require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Division = require('./models/Division');
const Classroom = require('./models/Classroom');
const TimeSlot = require('./models/TimeSlot');
const Timetable = require('./models/Timetable');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const PERIODS = [
  { period: 1, startTime: '09:00', endTime: '10:00' },
  { period: 2, startTime: '10:00', endTime: '11:00' },
  { period: 3, startTime: '11:15', endTime: '12:15' },
  { period: 4, startTime: '12:15', endTime: '13:15' },
  { period: 5, startTime: '14:00', endTime: '15:00' },
  { period: 6, startTime: '15:00', endTime: '16:00' },
  { period: 7, startTime: '16:00', endTime: '17:00' }
];

function fullAvailability(unavailable = []) {
  const slots = [];
  for (const day of DAYS) {
    for (const p of PERIODS) {
      const blocked = unavailable.some((u) => u.day === day && u.period === p.period);
      slots.push({ day, period: p.period, available: !blocked });
    }
  }
  return slots;
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Teacher.deleteMany({}),
    Subject.deleteMany({}),
    Division.deleteMany({}),
    Classroom.deleteMany({}),
    TimeSlot.deleteMany({}),
    Timetable.deleteMany({})
  ]);

  await User.create({
    name: 'OMKAR ADMIN MODE',
    email: 'omkardeshmane832@gmail.com',
    password: 'GLITCHGOD',
    role: 'admin'
  });

  const teachers = await Teacher.insertMany([
    {
      name: 'Rahul Patil',
      email: 'rahul.patil@college.edu',
      department: 'Computer Engineering',
      availability: fullAvailability([{ day: 'Friday', period: 7 }])
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha.kulkarni@college.edu',
      department: 'Computer Engineering',
      availability: fullAvailability([{ day: 'Monday', period: 1 }])
    },
    {
      name: 'Amit Joshi',
      email: 'amit.joshi@college.edu',
      department: 'Computer Engineering',
      availability: fullAvailability([{ day: 'Wednesday', period: 5 }])
    },
    {
      name: 'Priya Deshmukh',
      email: 'priya.deshmukh@college.edu',
      department: 'Computer Engineering',
      availability: fullAvailability([{ day: 'Thursday', period: 7 }])
    },
    {
      name: 'Vikram Shah',
      email: 'vikram.shah@college.edu',
      department: 'Computer Engineering',
      availability: fullAvailability([{ day: 'Tuesday', period: 1 }])
    }
  ]);

  const [rahul, sneha, amit, priya, vikram] = teachers;

  const divisions = await Division.insertMany([
    {
      name: 'SE-A',
      department: 'Computer Engineering',
      year: 'SE',
      semester: 4,
      studentCount: 60
    },
    {
      name: 'SE-B',
      department: 'Computer Engineering',
      year: 'SE',
      semester: 4,
      studentCount: 58
    }
  ]);

  const [seA, seB] = divisions;

  await Classroom.insertMany([
    { roomNumber: 'C-101', capacity: 70, type: 'Theory', unavailableSlots: [] },
    { roomNumber: 'C-102', capacity: 70, type: 'Theory', unavailableSlots: [] },
    { roomNumber: 'C-103', capacity: 70, type: 'Theory', unavailableSlots: [] },
    { roomNumber: 'L-201', capacity: 70, type: 'Lab', unavailableSlots: [] },
    { roomNumber: 'L-202', capacity: 70, type: 'Lab', unavailableSlots: [] }
  ]);

  const timeSlots = [];
  for (const day of DAYS) {
    for (const period of PERIODS) {
      timeSlots.push({ day, ...period });
    }
  }
  await TimeSlot.insertMany(timeSlots);

  const catalog = [
    { name: 'Data Structures', code: 'DS', teacher: rahul, lecturesPerWeek: 4, type: 'Theory' },
    { name: 'Database Management System', code: 'DBMS', teacher: sneha, lecturesPerWeek: 4, type: 'Theory' },
    { name: 'Computer Networks', code: 'CN', teacher: amit, lecturesPerWeek: 3, type: 'Theory' },
    { name: 'Operating Systems', code: 'OS', teacher: priya, lecturesPerWeek: 3, type: 'Theory' },
    { name: 'Web Technology', code: 'WT', teacher: vikram, lecturesPerWeek: 3, type: 'Theory' },
    { name: 'Software Engineering', code: 'SE', teacher: rahul, lecturesPerWeek: 2, type: 'Theory' },
    { name: 'Computer Organization', code: 'COA', teacher: amit, lecturesPerWeek: 2, type: 'Theory' }
  ];

  const subjects = [];
  for (const division of divisions) {
    for (const item of catalog) {
      subjects.push({
        name: item.name,
        code: item.code,
        teacher: item.teacher._id,
        division: division._id,
        lecturesPerWeek: item.lecturesPerWeek,
        type: item.type
      });
    }
  }

  await Subject.insertMany(subjects);

  console.log('Seed completed.');
  console.log('Admin login: admin@college.edu / admin123');
  console.log(`Teachers: ${teachers.length}, Divisions: ${divisions.length}, Subjects: ${subjects.length}`);
  console.log(`Time slots: ${timeSlots.length} (Mon-Fri, 7 periods)`);

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
