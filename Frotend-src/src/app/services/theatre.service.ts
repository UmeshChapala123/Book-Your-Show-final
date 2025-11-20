import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Theatre { id:number; name:string; city:string; address:string; }

@Injectable({ providedIn: 'root' })
export class TheatreService {
  private base = `${environment.apiUrl}/theatres`;
  private subject = new BehaviorSubject<Theatre[]>([]);
  list$ = this.subject.asObservable();

  constructor(private http: HttpClient) { this.refresh(); }

  async refresh(){
    const data = await firstValueFrom(this.http.get<Theatre[]>(this.base));
    data.sort((a: Theatre, b: Theatre) => a.id - b.id);
    this.subject.next(data);
  }

  getAll(){ return this.subject.getValue(); }
  getById(id: number | string){ const n = Number(id); return this.getAll().find(t=>Number(t.id)===n); }

  private ensureUnique(name:string, city:string, ignoreId?:number) {
    const exists = this.getAll().some(t =>
      t.name.toLowerCase()===name.toLowerCase() &&
      t.city.toLowerCase()===city.toLowerCase() &&
      t.id !== ignoreId
    );
    if (exists) throw new Error('Theatre already exists in this city');
  }

  private nextId(): number { const items=this.getAll(); return items.length?Math.max(...items.map(i=>i.id))+1:1; }

  async create(payload: Omit<Theatre,'id'>) {
    this.ensureUnique(payload.name, payload.city);
    const id = this.nextId();
    await firstValueFrom(this.http.post<Theatre>(this.base, { id, ...payload }));
    await this.refresh();
  }

  async update(id:number, changes: Partial<Theatre>) {
    const curr = this.getById(id);
    if (!curr) throw new Error('Theatre not found');
    if (changes.name || changes.city) this.ensureUnique(changes.name ?? curr.name, changes.city ?? curr.city, id);
    await firstValueFrom(this.http.patch<Theatre>(`${this.base}/${id}`, changes));
    await this.refresh();
  }

  async delete(id:number){ await firstValueFrom(this.http.delete(`${this.base}/${id}`)); await this.refresh(); }
}