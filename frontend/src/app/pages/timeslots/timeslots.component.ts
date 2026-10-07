import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-timeslots',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './timeslots.component.html'
})
export class TimeslotsComponent implements OnInit {
  slots: any[] = [];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  form: any = { day: 'Monday', period: 1, startTime: '09:00', endTime: '10:00' };
  weekPeriods = [
    { period: 1, startTime: '09:00', endTime: '10:00' },
    { period: 2, startTime: '10:00', endTime: '11:00' },
    { period: 3, startTime: '11:15', endTime: '12:15' },
    { period: 4, startTime: '12:15', endTime: '13:15' },
    { period: 5, startTime: '14:00', endTime: '15:00' },
    { period: 6, startTime: '15:00', endTime: '16:00' },
    { period: 7, startTime: '16:00', endTime: '17:00' }
  ];
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getTimeSlots().subscribe({
      next: (rows) => (this.slots = rows),
      error: (err) => (this.error = apiError(err))
    });
  }

  save() {
    this.error = '';
    this.api.createTimeSlot(this.form).subscribe({
      next: () => {
        this.success = 'Time slot added';
        this.load();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  applyWeek() {
    this.error = '';
    this.api.replaceWeek(this.weekPeriods).subscribe({
      next: () => {
        this.success = 'Monday-Friday periods replaced';
        this.load();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  remove(slot: any) {
    if (!confirm(`Delete ${slot.day} period ${slot.period}?`)) return;
    this.api.deleteTimeSlot(slot._id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = apiError(err))
    });
  }
}
