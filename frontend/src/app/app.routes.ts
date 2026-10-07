import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TeachersComponent } from './pages/teachers/teachers.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { DivisionsComponent } from './pages/divisions/divisions.component';
import { ClassroomsComponent } from './pages/classrooms/classrooms.component';
import { TimeslotsComponent } from './pages/timeslots/timeslots.component';
import { AvailabilityComponent } from './pages/availability/availability.component';
import { TimetableComponent } from './pages/timetable/timetable.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'teachers', component: TeachersComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'divisions', component: DivisionsComponent },
      { path: 'classrooms', component: ClassroomsComponent },
      { path: 'timeslots', component: TimeslotsComponent },
      { path: 'availability', component: AvailabilityComponent },
      { path: 'timetable', component: TimetableComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
