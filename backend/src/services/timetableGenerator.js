const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Division = require('../models/Division');
const Classroom = require('../models/Classroom');
const TimeSlot = require('../models/TimeSlot');
const Timetable = require('../models/Timetable');
const {
  DAYS,
  isTeacherAvailable,
  isClassroomAvailable,
  classroomFitsSubject
} = require('./constraints');

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadTeacher(teachers, id) {
  return teachers.find((t) => String(t._id) === String(id));
}

function loadDivision(divisions, id) {
  return divisions.find((d) => String(d._id) === String(id));
}

function periodKey(day, period) {
  return `${day}#${period}`;
}

function occupiedAt(assignment, type, id, day, period) {
  const key = periodKey(day, period);
  return assignment[type][key]?.has(String(id));
}

function occupy(assignment, type, id, day, period) {
  const key = periodKey(day, period);
  if (!assignment[type][key]) assignment[type][key] = new Set();
  assignment[type][key].add(String(id));
}

function release(assignment, type, id, day, period) {
  const key = periodKey(day, period);
  assignment[type][key]?.delete(String(id));
}

function consecutivePenalty(lecture, candidate, current) {
  const sameDaySameSubject = current.filter(
    (a) =>
      a.day === candidate.day &&
      String(a.subject) === String(lecture.subjectId) &&
      Math.abs(a.period - candidate.period) === 1
  );
  return sameDaySameSubject.length;
}

function daySpreadPenalty(lecture, candidate, current) {
  return current.filter(
    (a) => a.day === candidate.day && String(a.subject) === String(lecture.subjectId)
  ).length;
}

function countTeacherSlots(teacher, timeSlots) {
  return timeSlots.filter((slot) => isTeacherAvailable(teacher, slot.day, slot.period)).length;
}

function expandLectures(subjects, teachers, divisions, timeSlots, classrooms) {
  const lectures = [];

  for (const subject of subjects) {
    const teacher = loadTeacher(teachers, subject.teacher);
    const division = loadDivision(divisions, subject.division);
    if (!teacher) {
      throw Object.assign(new Error(`Subject ${subject.name} has no assigned teacher.`), {
        statusCode: 400
      });
    }
    if (!division) {
      throw Object.assign(new Error(`Subject ${subject.name} has no assigned division.`), {
        statusCode: 400
      });
    }

    const rooms = classrooms.filter((room) => classroomFitsSubject(room, subject, division));
    if (!rooms.length) {
      throw Object.assign(
        new Error(
          `Unable to generate timetable because no suitable classroom exists for ${subject.name} (${subject.type}) in ${division.name}.`
        ),
        { statusCode: 400 }
      );
    }

    const possibleSlots = [];
    for (const slot of timeSlots) {
      if (!isTeacherAvailable(teacher, slot.day, slot.period)) continue;
      const usableRooms = rooms.filter((room) =>
        isClassroomAvailable(room, slot.day, slot.period)
      );
      if (!usableRooms.length) continue;
      possibleSlots.push({ slot, rooms: usableRooms });
    }

    if (possibleSlots.length < subject.lecturesPerWeek) {
      throw Object.assign(
        new Error(
          `Unable to generate timetable because no available slot exists for ${subject.name} (${division.name}). Required ${subject.lecturesPerWeek} lectures, but only ${possibleSlots.length} feasible slots were found.`
        ),
        { statusCode: 400 }
      );
    }

    for (let i = 1; i <= subject.lecturesPerWeek; i += 1) {
      lectures.push({
        id: `${subject._id}-${i}`,
        label: `${subject.code} Lecture ${i}`,
        subjectId: subject._id,
        subjectName: subject.name,
        subjectCode: subject.code,
        teacherId: teacher._id,
        teacherName: teacher.name,
        divisionId: division._id,
        divisionName: division.name,
        type: subject.type,
        possibleSlots,
        teacherAvailabilityCount: countTeacherSlots(teacher, timeSlots),
        roomCount: rooms.length
      });
    }
  }

  lectures.sort((a, b) => {
    const aScore = a.possibleSlots.length + a.teacherAvailabilityCount + a.roomCount;
    const bScore = b.possibleSlots.length + b.teacherAvailabilityCount + b.roomCount;
    if (aScore !== bScore) return aScore - bScore;
    return b.type === 'Practical' ? 1 : -1;
  });

  return lectures;
}

function orderCandidates(lecture, current) {
  const scored = [];

  for (const option of lecture.possibleSlots) {
    const { slot, rooms } = option;
    if (occupiedAt(current.map, 'division', lecture.divisionId, slot.day, slot.period)) continue;
    if (occupiedAt(current.map, 'teacher', lecture.teacherId, slot.day, slot.period)) continue;

    const freeRooms = rooms.filter(
      (room) => !occupiedAt(current.map, 'classroom', room._id, slot.day, slot.period)
    );
    if (!freeRooms.length) continue;

    const shuffledRooms = shuffle(freeRooms);
    for (const room of shuffledRooms) {
      const candidate = {
        day: slot.day,
        period: slot.period,
        classroom: room._id
      };
      const consecutive = consecutivePenalty(lecture, candidate, current.assignments);
      const spread = daySpreadPenalty(lecture, candidate, current.assignments);
      const dayIndex = DAYS.indexOf(slot.day);
      scored.push({
        candidate,
        score: consecutive * 20 + spread * 8 + dayIndex + slot.period * 0.1
      });
    }
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.candidate);
}

function assignLecture(lecture, candidate, current) {
  occupy(current.map, 'division', lecture.divisionId, candidate.day, candidate.period);
  occupy(current.map, 'teacher', lecture.teacherId, candidate.day, candidate.period);
  occupy(current.map, 'classroom', candidate.classroom, candidate.day, candidate.period);
  current.assignments.push({
    lectureId: lecture.id,
    division: lecture.divisionId,
    day: candidate.day,
    period: candidate.period,
    subject: lecture.subjectId,
    teacher: lecture.teacherId,
    classroom: candidate.classroom
  });
}

function unassignLast(lecture, candidate, current) {
  current.assignments.pop();
  release(current.map, 'division', lecture.divisionId, candidate.day, candidate.period);
  release(current.map, 'teacher', lecture.teacherId, candidate.day, candidate.period);
  release(current.map, 'classroom', candidate.classroom, candidate.day, candidate.period);
}

function solve(lectures, index, current) {
  if (index >= lectures.length) return true;

  const lecture = lectures[index];
  const candidates = orderCandidates(lecture, current);

  for (const candidate of candidates) {
    assignLecture(lecture, candidate, current);
    if (solve(lectures, index + 1, current)) return true;
    unassignLast(lecture, candidate, current);
  }

  current.failedLecture = lecture;
  return false;
}

async function generateTimetable() {
  const [divisions, subjects, teachers, classrooms, timeSlots] = await Promise.all([
    Division.find(),
    Subject.find(),
    Teacher.find(),
    Classroom.find(),
    TimeSlot.find().sort({ day: 1, period: 1 })
  ]);

  if (!divisions.length) {
    throw Object.assign(new Error('Add at least one division before generating a timetable.'), {
      statusCode: 400
    });
  }
  if (!subjects.length) {
    throw Object.assign(new Error('Add subjects before generating a timetable.'), {
      statusCode: 400
    });
  }
  if (!teachers.length) {
    throw Object.assign(new Error('Add teachers before generating a timetable.'), {
      statusCode: 400
    });
  }
  if (!classrooms.length) {
    throw Object.assign(new Error('Add classrooms before generating a timetable.'), {
      statusCode: 400
    });
  }
  if (!timeSlots.length) {
    throw Object.assign(new Error('Configure time slots before generating a timetable.'), {
      statusCode: 400
    });
  }

  const lectures = expandLectures(subjects, teachers, divisions, timeSlots, classrooms);
  const current = {
    assignments: [],
    map: { teacher: {}, classroom: {}, division: {} },
    failedLecture: null
  };

  const success = solve(lectures, 0, current);
  if (!success) {
    const failed = current.failedLecture;
    const detail = failed
      ? `Unable to generate timetable because no available slot exists for ${failed.subjectName} (${failed.divisionName}).`
      : 'Unable to generate a valid timetable with the current constraints.';
    throw Object.assign(new Error(detail), { statusCode: 409 });
  }

  await Timetable.deleteMany({});
  const saved = await Timetable.insertMany(current.assignments.map(({ lectureId, ...row }) => row));
  return {
    count: saved.length,
    entries: saved
  };
}

module.exports = { generateTimetable };
