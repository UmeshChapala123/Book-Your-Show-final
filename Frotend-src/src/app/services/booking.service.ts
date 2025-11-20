import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ShowService, Show } from './show.service';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';
export interface Booking { id:number; userId:number; showId:number; seats:number; totalPrice:number; status:BookingStatus; seatsSelected?: string[];}

function todayStr(){ const d=new Date(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return `${d.getFullYear()}-${mm}-${dd}`; }

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl= 'http://localhost:8080/api';
  private base = `${this.baseUrl}/bookings`;
  private subject = new BehaviorSubject<Booking[]>([]);
  list$ = this.subject.asObservable();

  constructor(private http: HttpClient, private shows: ShowService){ this.refresh(); }

  async refresh(){
    const data = await firstValueFrom(this.http.get<Booking[]>(this.base));
    data.sort((a: Booking, b: Booking) => a.id - b.id);
    this.subject.next(data);
  }

  getAll(){ return this.subject.getValue(); }
  getById(id: number | string){ const n = Number(id); return this.getAll().find(b=>Number(b.id) === n); }

  private async fetchShowFromServerById(id: number): Promise<Show> {
    // try direct endpoint
    try { return await firstValueFrom(this.http.get<Show>(`${environment.apiUrl}/shows/${id}`)); } catch {}
    // fallback to query
    try {
      const arr = await firstValueFrom(this.http.get<Show[]>(`${environment.apiUrl}/shows`, { params: { id: String(id) } }));
      if (Array.isArray(arr) && arr.length) return arr[0];
    } catch {}
    // last resort refresh in-memory
    await this.shows.refresh();
    const local = this.shows.getById(id);
    if (local) return local;
    throw new Error('Show not found');
  }

  private nextId(): number { const items=this.getAll(); return items.length?Math.max(...items.map(i=>i.id))+1:1; }

  private async ensureNotPast(showId:number){
    let s = this.shows.getById(showId);
    if (!s) {
      s = await this.fetchShowFromServerById(showId);
    }
    if (!s) throw new Error('Show not found');
    if (s.date < todayStr()) throw new Error('Cannot book a past show');
  }

  async create(payload: Omit<Booking, 'id' | 'totalPrice'>, pricePerSeat?: number) {
    await this.ensureNotPast(payload.showId);
    const s = await this.fetchShowFromServerById(payload.showId);
  
    if (payload.seats <= 0) throw new Error('Seats must be > 0');
    if (payload.status === 'CONFIRMED' && payload.seats > s.seatsAvailable) throw new Error('Seats exceed availability');
  
    const totalPrice = (pricePerSeat ?? s.price) * payload.seats;
  
    let created: Booking | undefined;
    try {
      // ✅ Correct URL and body
      created = await firstValueFrom(
        this.http.post<Booking>(`${this.base}`, { ...payload, totalPrice })
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create booking.');
    }
  
    await this.refresh();
    return created!;
  }
  

  async update(id:number, changes: Partial<Booking>){
    const prev = this.getById(id); if(!prev) throw new Error('Booking not found');
    const next = { ...prev, ...changes } as Booking;

    await this.ensureNotPast(next.showId);
    const newShow = await this.fetchShowFromServerById(next.showId);

    // Basic approach: apply patch, then adjust seats accordingly
    try {
      await firstValueFrom(this.http.patch(`${this.base}/${id}`, changes));
      // Handle seats adjustments if needed by refreshing shows
      await this.shows.refresh();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update booking.');
    }

    await this.refresh();
  }

  async delete(id:number){
    const prev = this.getById(id);
    if (!prev) return;

    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`));
      if (prev.status === 'CONFIRMED') {
        // restore seats on server
        try {
          const s = await firstValueFrom(this.http.get<Show>(`${this.base}/shows/${prev.showId}`));
          await firstValueFrom(this.http.patch(`${this.base}/shows/${prev.showId}`, { seatsAvailable: s.seatsAvailable + prev.seats }));
        } catch {}
        await this.shows.refresh();
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete booking.');
    }

    await this.refresh();
  }
}