import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-classrooms',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './classrooms.component.html'
})
export class ClassroomsComponent implements OnInit {
  classrooms: any[] = [];
  form: any = { roomNumber: '', capacity: 70, type: 'Theory' };
  editingId: string | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getClassrooms().subscribe({
      next: (rows) => (this.classrooms = rows),
      error: (err) => (this.error = apiError(err))
    });
  }

  save() {
    this.error = '';
    const req = this.editingId
      ? this.api.updateClassroom(this.editingId, this.form)
      : this.api.createClassroom(this.form);
    req.subscribe({
      next: () => {
        this.success = this.editingId ? 'Classroom updated' : 'Classroom added';
        this.reset();
        this.load();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  edit(row: any) {
    this.editingId = row._id;
    this.form = {
      roomNumber: row.roomNumber,
      capacity: row.capacity,
      type: row.type,
      unavailableSlots: row.unavailableSlots || []
    };
  }

  remove(row: any) {
    if (!confirm(`Delete classroom ${row.roomNumber}?`)) return;
    this.api.deleteClassroom(row._id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = apiError(err))
    });
  }

  reset() {
    this.editingId = null;
    this.form = { roomNumber: '', capacity: 70, type: 'Theory' };
  }
}
