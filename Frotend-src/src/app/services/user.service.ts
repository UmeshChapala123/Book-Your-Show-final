import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User { id:number; name:string; email:string; phone:string; }

@Injectable({ providedIn: 'root' })
export class UserService {

  private base = `${environment.apiUrl}/users`;
  private subject = new BehaviorSubject<User[]>([]);
  list$ = this.subject.asObservable();

  constructor(private http: HttpClient) { this.refresh(); }

  async refresh() {
    const data = await firstValueFrom(this.http.get<User[]>(this.base));
    data.sort((a: User, b: User) => a.id - b.id);
    this.subject.next(data);
  }

  getAll() { return this.subject.getValue(); }
  getById(id: number | string) { const n = Number(id); return this.getAll().find(u=>Number(u.id) === n); }

  private ensureUniqueEmail(email:string, ignoreId?:number) {
    const exists = this.getAll().some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== ignoreId);
    if (exists) throw new Error('Email already exists');
  }

  private nextId(): number {
    const items = this.getAll();
    return items.length ? Math.max(...items.map(i=>i.id)) + 1 : 1;
  }

  async create(payload: Omit<User,'id'>) {
    this.ensureUniqueEmail(payload.email);
    const id = this.nextId();
    await firstValueFrom(this.http.post<User>(this.base, { id, ...payload }));
    await this.refresh();
  }

  async update(id:number, changes: Partial<User>) {
    if (changes.email) this.ensureUniqueEmail(changes.email, id);
    await firstValueFrom(this.http.patch<User>(`${this.base}/${id}`, changes));
    await this.refresh();
  }

  async delete(id:number) {
    await firstValueFrom(this.http.delete(`${this.base}/${id}`));
    await this.refresh();
  }
}