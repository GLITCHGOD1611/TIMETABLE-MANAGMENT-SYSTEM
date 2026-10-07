import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  dashboard() {
    return this.http.get<any>(`${this.base}/dashboard`);
  }

  getTeachers() {
    return this.http.get<any[]>(`${this.base}/teachers`);
  }

  createTeacher(body: any) {
    return this.http.post<any>(`${this.base}/teachers`, body);
  }

  updateTeacher(id: string, body: any) {
    return this.http.put<any>(`${this.base}/teachers/${id}`, body);
  }

  deleteTeacher(id: string) {
    return this.http.delete(`${this.base}/teachers/${id}`);
  }

  updateAvailability(id: string, availability: any[]) {
    return this.http.put<any>(`${this.base}/teachers/${id}/availability`, { availability });
  }

  getSubjects(division?: string) {
    let params = new HttpParams();
    if (division) params = params.set('division', division);
    return this.http.get<any[]>(`${this.base}/subjects`, { params });
  }

  createSubject(body: any) {
    return this.http.post<any>(`${this.base}/subjects`, body);
  }

  updateSubject(id: string, body: any) {
    return this.http.put<any>(`${this.base}/subjects/${id}`, body);
  }

  deleteSubject(id: string) {
    return this.http.delete(`${this.base}/subjects/${id}`);
  }

  getDivisions() {
    return this.http.get<any[]>(`${this.base}/divisions`);
  }

  createDivision(body: any) {
    return this.http.post<any>(`${this.base}/divisions`, body);
  }

  updateDivision(id: string, body: any) {
    return this.http.put<any>(`${this.base}/divisions/${id}`, body);
  }

  deleteDivision(id: string) {
    return this.http.delete(`${this.base}/divisions/${id}`);
  }

  getClassrooms() {
    return this.http.get<any[]>(`${this.base}/classrooms`);
  }

  createClassroom(body: any) {
    return this.http.post<any>(`${this.base}/classrooms`, body);
  }

  updateClassroom(id: string, body: any) {
    return this.http.put<any>(`${this.base}/classrooms/${id}`, body);
  }

  deleteClassroom(id: string) {
    return this.http.delete(`${this.base}/classrooms/${id}`);
  }

  getTimeSlots() {
    return this.http.get<any[]>(`${this.base}/timeslots`);
  }

  createTimeSlot(body: any) {
    return this.http.post<any>(`${this.base}/timeslots`, body);
  }

  replaceWeek(periods: any[]) {
    return this.http.post<any[]>(`${this.base}/timeslots/week`, { periods });
  }

  updateTimeSlot(id: string, body: any) {
    return this.http.put<any>(`${this.base}/timeslots/${id}`, body);
  }

  deleteTimeSlot(id: string) {
    return this.http.delete(`${this.base}/timeslots/${id}`);
  }

  getTimetable(division?: string) {
    let params = new HttpParams();
    if (division) params = params.set('division', division);
    return this.http.get<any[]>(`${this.base}/timetable`, { params });
  }

  generateTimetable() {
    return this.http.post<any>(`${this.base}/timetable/generate`, {});
  }

  updateTimetableCell(id: string, body: any) {
    return this.http.put<any>(`${this.base}/timetable/${id}`, body);
  }

  clearTimetable() {
    return this.http.delete(`${this.base}/timetable`);
  }
}

export function apiError(err: any): string {
  return err?.error?.message || err?.message || 'Something went wrong';
}
