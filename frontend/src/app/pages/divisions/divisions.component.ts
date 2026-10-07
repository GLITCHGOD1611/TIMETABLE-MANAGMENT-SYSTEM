import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-divisions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './divisions.component.html'
})
export class DivisionsComponent implements OnInit {
  divisions: any[] = [];
  form: any = {
    name: '',
    department: 'Computer Engineering',
    year: 'SE',
    semester: 4,
    studentCount: 60
  };
  editingId: string | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getDivisions().subscribe({
      next: (rows) => (this.divisions = rows),
      error: (err) => (this.error = apiError(err))
    });
  }

  save() {
    this.error = '';
    const req = this.editingId
      ? this.api.updateDivision(this.editingId, this.form)
      : this.api.createDivision(this.form);
    req.subscribe({
      next: () => {
        this.success = this.editingId ? 'Division updated' : 'Division added';
        this.reset();
        this.load();
      },
      error: (err) => (this.error = apiError(err))
    });
  }

  edit(row: any) {
    this.editingId = row._id;
    this.form = {
      name: row.name,
      department: row.department,
      year: row.year,
      semester: row.semester,
      studentCount: row.studentCount
    };
  }

  remove(row: any) {
    if (!confirm(`Delete ${row.name}?`)) return;
    this.api.deleteDivision(row._id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = apiError(err))
    });
  }

  reset() {
    this.editingId = null;
    this.form = {
      name: '',
      department: 'Computer Engineering',
      year: 'SE',
      semester: 4,
      studentCount: 60
    };
  }
}
