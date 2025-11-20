import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Show { id:number; movieTitle:string; theatreId:number; date:string; time:string; price:number; seatsAvailable:number; }

function todayStr(){ const d=new Date(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return `${d.getFullYear()}-${mm}-${dd}`; }

@Injectable({ providedIn: 'root' })
export class ShowService {
  private base = `${environment.apiUrl}/shows`;
  private subject = new BehaviorSubject<Show[]>([]);
  list$ = this.subject.asObservable();

  constructor(private http: HttpClient){ this.refresh(); }

  async refresh(){
    const data = await firstValueFrom(this.http.get<Show[]>(this.base));
    data.sort((a: Show, b: Show) => a.id - b.id);
    this.subject.next(data);
  }

  getAll(){ return this.subject.getValue(); }
  getById(id: number | string){ const n = Number(id); return this.getAll().find(s=>Number(s.id)===n); }

  private ensureFuture(date:string){ if(date < todayStr()) throw new Error('Show date cannot be in the past'); }
  private ensureUnique(s: Omit<Show,'id'>, ignoreId?:number){
    const exists = this.getAll().some(x =>
      x.theatreId===s.theatreId &&
      x.movieTitle.trim().toLowerCase()===s.movieTitle.trim().toLowerCase() &&
      x.date===s.date && x.time===s.time &&
      x.id !== ignoreId
    );
    if (exists) throw new Error('Duplicate show (theatre+movie+date+time)');
  }

  private nextId(): number { const items=this.getAll(); return items.length?Math.max(...items.map(i=>i.id))+1:1; }

  async create(payload: Omit<Show,'id'>){
    this.ensureFuture(payload.date); this.ensureUnique(payload);
    const id = this.nextId();
    await firstValueFrom(this.http.post<Show>(this.base, { id, ...payload }));
    await this.refresh();
  }

  async update(id:number, changes: Partial<Show>){
    const curr=this.getById(id); if(!curr) throw new Error('Show not found');
    const merged={...curr, ...changes};
    this.ensureFuture(merged.date); this.ensureUnique(merged, id);
    await firstValueFrom(this.http.patch<Show>(`${this.base}/${id}`, changes));
    await this.refresh();
  }

  async patchSeats(id:number, seatsAvailable:number){
    await firstValueFrom(this.http.patch<Show>(`${this.base}/${id}`, { seatsAvailable }));
    await this.refresh();
  }

  async delete(id:number){ await firstValueFrom(this.http.delete(`${this.base}/${id}`)); await this.refresh(); }
}