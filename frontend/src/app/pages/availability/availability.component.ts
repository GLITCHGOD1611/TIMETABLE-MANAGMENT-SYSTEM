import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './availability.component.html'
})
export class AvailabilityComponent implements OnInit {
  teachers: any[] = [];
  slots: any[] = [];
  selectedId = '';
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  periods: number[] = [];
  grid: Record<string, boolean> = {};
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getTeachers().subscribe((rows) => {
      this.teachers = rows;
      if (rows[0]) {
        this.selectedId = rows[0]._id;
        this.buildGrid();
      }
    });
    this.api.getTimeSlots().subscribe((rows) => {
      this.slots = rows;
      this.periods = [...new Set(rows.map((s) => s.period))].sort((a, b) => a - b);
      this.buildGrid();
    });
  }

  key(day: string, period: number) {
    return `${day}-${period}`;
  }

  buildGrid() {
    const teacher = this.teachers.find((t) => t._id === this.selectedId);
    this.grid = {};
    for (const day of this.days) {
      for (const period of this.periods) {
        const match = teacher?.availability?.find(
          (a: any) => a.day === day && a.period === period
        );
        this.grid[this.key(day, period)] = match ? match.available !== false : true;
      }
    }
  }

  onTeacherChange() {
    this.buildGrid();
  }

  save() {
    this.error = '';
    const availability: any[] = [];
    for (const day of this.days) {
      for (const period of this.periods) {
        availability.push({
          day,
          period,
          available: this.grid[this.key(day, period)] !== false
        });
      }
    }
    this.api.updateAvailability(this.selectedId, availability).subscribe({
      next: (teacher) => {
        this.success = `Availability saved for ${teacher.name}`;
        const idx = this.teachers.findIndex((t) => t._id === teacher._id);
        if (idx >= 0) this.teachers[idx] = teacher;
      },
      error: (err) => (this.error = apiError(err))
    });
  }
}
