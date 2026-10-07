import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.scss'
})
export class TimetableComponent implements OnInit {
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  divisions: any[] = [];
  subjects: any[] = [];
  classrooms: any[] = [];
  slots: any[] = [];
  entries: any[] = [];
  selectedDivision = '';
  periods: { period: number; startTime: string; endTime: string }[] = [];
  generating = false;
  error = '';
  success = '';
  editing: any = null;
  editForm: any = { subject: '', teacher: '', classroom: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDivisions().subscribe((rows) => {
      this.divisions = rows;
      if (rows[0]) {
        this.selectedDivision = rows[0]._id;
        this.refresh();
      }
    });
    this.api.getClassrooms().subscribe((rows) => (this.classrooms = rows));
    this.api.getTimeSlots().subscribe((rows) => {
      this.slots = rows;
      this.buildPeriods();
    });
  }

  buildPeriods() {
    const unique = new Map<number, { period: number; startTime: string; endTime: string }>();
    for (const slot of this.slots) {
      if (!unique.has(slot.period)) {
        unique.set(slot.period, {
          period: slot.period,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    }
    this.periods = [...unique.values()].sort((a, b) => a.period - b.period);
  }

  refresh() {
    if (!this.selectedDivision) return;
    this.api.getTimetable(this.selectedDivision).subscribe({
      next: (rows) => (this.entries = rows),
      error: (err) => (this.error = apiError(err))
    });
    this.api.getSubjects(this.selectedDivision).subscribe((rows) => (this.subjects = rows));
  }

  cell(day: string, period: number) {
    return this.entries.find((e) => e.day === day && e.period === period);
  }

  generate() {
    this.error = '';
    this.success = '';
    this.generating = true;
    this.api.generateTimetable().subscribe({
      next: (res) => {
        this.success = res.message;
        this.generating = false;
        this.refresh();
      },
      error: (err) => {
        this.error = apiError(err);
        this.generating = false;
      }
    });
  }

  openEdit(entry: any) {
    if (!entry) return;
    this.editing = entry;
    this.editForm = {
      subject: entry.subject?._id,
      teacher: entry.teacher?._id,
      classroom: entry.classroom?._id
    };
  }

  onSubjectChange() {
    const subject = this.subjects.find((s) => s._id === this.editForm.subject);
    if (subject?.teacher?._id) {
      this.editForm.teacher = subject.teacher._id;
    }
  }

  uniqueTeachers() {
    const map = new Map<string, any>();
    for (const s of this.subjects) {
      if (s.teacher?._id) map.set(s.teacher._id, s.teacher);
    }
    return [...map.values()];
  }

  saveEdit() {
    if (!this.editing) return;
    this.error = '';
    this.api.updateTimetableCell(this.editing._id, this.editForm).subscribe({
      next: () => {
        this.success = 'Timetable cell updated';
        this.editing = null;
        this.refresh();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  print() {
    window.print();
  }

  selectedDivisionName() {
    return this.divisions.find((d) => d._id === this.selectedDivision)?.name || '';
  }
}
