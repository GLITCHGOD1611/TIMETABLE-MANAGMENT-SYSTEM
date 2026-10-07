import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './subjects.component.html'
})
export class SubjectsComponent implements OnInit {
  subjects: any[] = [];
  teachers: any[] = [];
  divisions: any[] = [];
  form: any = {
    name: '',
    code: '',
    teacher: '',
    division: '',
    lecturesPerWeek: 3,
    type: 'Theory'
  };
  editingId: string | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getTeachers().subscribe((rows) => (this.teachers = rows));
    this.api.getDivisions().subscribe((rows) => (this.divisions = rows));
    this.load();
  }

  load() {
    this.api.getSubjects().subscribe({
      next: (rows) => (this.subjects = rows),
      error: (err) => (this.error = apiError(err))
    });
  }

  save() {
    this.error = '';
    const req = this.editingId
      ? this.api.updateSubject(this.editingId, this.form)
      : this.api.createSubject(this.form);
    req.subscribe({
      next: () => {
        this.success = this.editingId ? 'Subject updated' : 'Subject added';
        this.reset();
        this.load();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  edit(subject: any) {
    this.editingId = subject._id;
    this.form = {
      name: subject.name,
      code: subject.code,
      teacher: subject.teacher?._id || subject.teacher,
      division: subject.division?._id || subject.division,
      lecturesPerWeek: subject.lecturesPerWeek,
      type: subject.type
    };
  }

  remove(subject: any) {
    if (!confirm(`Delete ${subject.name}?`)) return;
    this.api.deleteSubject(subject._id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = apiError(err))
    });
  }

  reset() {
    this.editingId = null;
    this.form = {
      name: '',
      code: '',
      teacher: '',
      division: '',
      lecturesPerWeek: 3,
      type: 'Theory'
    };
  }
}
