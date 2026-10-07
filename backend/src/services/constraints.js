const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function idsEqual(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

function isTeacherAvailable(teacher, day, period) {
  const slots = teacher.availability || [];
  if (!slots.length) return true;
  const match = slots.find((s) => s.day === day && Number(s.period) === Number(period));
  if (!match) return true;
  return match.available !== false;
}

function isClassroomAvailable(classroom, day, period) {
  const blocked = classroom.unavailableSlots || [];
  return !blocked.some((s) => s.day === day && Number(s.period) === Number(period));
}

function classroomFitsSubject(classroom, subject, division) {
  if (!classroom || !subject) return false;
  const neededType = subject.type === 'Practical' ? 'Lab' : 'Theory';
  if (classroom.type !== neededType) return false;
  if (division && classroom.capacity < (division.studentCount || 0)) return false;
  return true;
}

function findConflict(entries, candidate, { teacher, classroom, division, subject }) {
  const { day, period } = candidate;
  const teacherId = candidate.teacher || teacher?._id;
  const classroomId = candidate.classroom || classroom?._id;
  const divisionId = candidate.division || division?._id;
  const ignoreId = candidate.ignoreId ? String(candidate.ignoreId) : null;

  for (const entry of entries) {
    if (ignoreId && String(entry._id) === ignoreId) continue;
    if (entry.day !== day || Number(entry.period) !== Number(period)) continue;

    const entryTeacher = entry.teacher?._id || entry.teacher;
    const entryClassroom = entry.classroom?._id || entry.classroom;
    const entryDivision = entry.division?._id || entry.division;

    if (idsEqual(entryTeacher, teacherId)) {
      const otherDiv = entry.division?.name || 'another division';
      const teacherName = teacher?.name || entry.teacher?.name || 'This teacher';
      return `Teacher conflict: ${teacherName} is already assigned to ${otherDiv} during ${day} Period ${period}.`;
    }

    if (idsEqual(entryClassroom, classroomId)) {
      const room = classroom?.roomNumber || entry.classroom?.roomNumber || 'This classroom';
      const otherDiv = entry.division?.name || 'another division';
      return `Classroom conflict: ${room} is already assigned to ${otherDiv} during ${day} Period ${period}.`;
    }

    if (idsEqual(entryDivision, divisionId)) {
      const divName = division?.name || entry.division?.name || 'This division';
      return `Division conflict: ${divName} already has a lecture during ${day} Period ${period}.`;
    }
  }

  if (teacher && !isTeacherAvailable(teacher, day, period)) {
    return `Teacher ${teacher.name} is unavailable during ${day} Period ${period}.`;
  }

  if (classroom && !isClassroomAvailable(classroom, day, period)) {
    return `Classroom ${classroom.roomNumber} is unavailable during ${day} Period ${period}.`;
  }

  if (classroom && subject && division && !classroomFitsSubject(classroom, subject, division)) {
    if (classroom.type !== (subject.type === 'Practical' ? 'Lab' : 'Theory')) {
      return `Classroom ${classroom.roomNumber} is a ${classroom.type} room and cannot be used for ${subject.type} subject ${subject.name}.`;
    }
    return `Classroom ${classroom.roomNumber} capacity (${classroom.capacity}) is less than ${division.name} student count (${division.studentCount}).`;
  }

  return null;
}

function countSubjectLectures(entries, subjectId, ignoreId) {
  return entries.filter((entry) => {
    if (ignoreId && String(entry._id) === String(ignoreId)) return false;
    const sid = entry.subject?._id || entry.subject;
    return idsEqual(sid, subjectId);
  }).length;
}

module.exports = {
  DAYS,
  idsEqual,
  isTeacherAvailable,
  isClassroomAvailable,
  classroomFitsSubject,
  findConflict,
  countSubjectLectures
};
