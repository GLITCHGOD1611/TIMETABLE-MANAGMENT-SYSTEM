import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, apiError } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.dashboard().subscribe({
      next: (data) => (this.stats = data),
      error: (err) => (this.error = apiError(err))
    });
  }
}
