import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './teachers.component.html'
})
export class TeachersComponent implements OnInit {
  teachers: any[] = [];
  form: any = { name: '', email: '', department: 'Computer Engineering' };
  editingId: string | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getTeachers().subscribe({
      next: (rows) => (this.teachers = rows),
      error: (err) => (this.error = apiError(err))
    });
  }

  save() {
    this.error = '';
    this.success = '';
    const req = this.editingId
      ? this.api.updateTeacher(this.editingId, this.form)
      : this.api.createTeacher(this.form);

    req.subscribe({
      next: () => {
        this.success = this.editingId ? 'Teacher updated' : 'Teacher added';
        this.reset();
        this.load();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  edit(teacher: any) {
    this.editingId = teacher._id;
    this.form = {
      name: teacher.name,
      email: teacher.email,
      department: teacher.department
    };
  }

  remove(teacher: any) {
    if (!confirm(`Delete ${teacher.name}?`)) return;
    this.api.deleteTeacher(teacher._id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = apiError(err))
    });
  }

  reset() {
    this.editingId = null;
    this.form = { name: '', email: '', department: 'Computer Engineering' };
  }
}
