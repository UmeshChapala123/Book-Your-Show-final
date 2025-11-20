import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../services/booking.service';
import { UserService, User } from '../../services/user.service';
import { ShowService, Show } from '../../services/show.service';
import { CommonModule } from '@angular/common';

function todayStr(){ const d=new Date(); const mm=(d.getMonth()+1).toString().padStart(2,'0'); const dd=d.getDate().toString().padStart(2,'0'); return `${d.getFullYear()}-${mm}-${dd}`; }
type BookingFormControlName = 'userId' | 'showId' | 'seats' | 'status';

@Component({
  standalone: true,
  selector: 'app-booking-form',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">{{ isEdit ? 'Edit Booking' : 'Create Booking' }}</h2>
      <a class="btn btn-outline-secondary" routerLink="/bookings">Back</a>
    </div>
    <div *ngIf="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>
    <div *ngIf="!formReady" class="alert alert-info">Loading form...</div>
    <form *ngIf="formReady" (ngSubmit)="submit()" [formGroup]="form" novalidate class="row g-3">
      <div class="col-12 col-md-6">
        <label class="form-label">User</label>
        <select formControlName="userId" class="form-select" [class.is-invalid]="invalid('userId')">
          <option [ngValue]="null" disabled>Select user</option>
          <option *ngFor="let u of users" [ngValue]="u.id">{{u.name}} ({{u.email}})</option>
        </select>
        <div class="invalid-feedback">User is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Show</label>
        <select formControlName="showId" class="form-select" [class.is-invalid]="invalid('showId')">
          <option [ngValue]="null" disabled>Select show</option>
          <option *ngFor="let s of futureShows" [ngValue]="s.id">
            {{s.movieTitle}} — {{s.date}} {{s.time}} (₹{{s.price}}) [Seats: {{s.seatsAvailable}}]
          </option>
        </select>
        <div class="invalid-feedback">Show is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Seats</label>
        <input type="number" formControlName="seats" class="form-control" [class.is-invalid]="invalid('seats')">
        <div class="invalid-feedback">Seats must be >= 1 and within availability.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Status</label>
        <select formControlName="status" class="form-select" [class.is-invalid]="invalid('status')">
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <div class="invalid-feedback">Status is required.</div>
      </div>
      <div class="col-12">
        <div class="alert alert-secondary py-2 mb-0">
          <div><strong>Available:</strong> {{ available }}</div>
          <div><strong>Price per seat:</strong> ₹ {{ selectedShow?.price ?? 0 }}</div>
          <div><strong>Total:</strong> ₹ {{ total }}</div>
        </div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ isEdit ? 'Save Changes' : 'Create Booking' }}</button>
      </div>
    </form>
  `
})
export class BookingFormComponent implements OnInit {
  isEdit=false; id?:number; errorMsg=''; formReady=false;
  users: User[]=[]; shows: Show[]=[]; futureShows: Show[]=[]; selectedShow?: Show;
  minDate = todayStr();

  form = this.fb.group({
    userId:[null as unknown as number,[Validators.required]],
    showId:[null as unknown as number,[Validators.required]],
    seats:[1,[Validators.required, Validators.min(1)]],
    status:['CONFIRMED' as 'CONFIRMED'|'CANCELLED',[Validators.required]]
  });

  get total(){ const s=this.form.controls.seats.value ?? 0; const p=this.selectedShow?.price ?? 0; return s*p; }
  get available(){ return this.selectedShow?.seatsAvailable ?? 0; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: BookingService,
    private userSvc: UserService,
    private showSvc: ShowService
  ){}

  ngOnInit() {
    this.initializeForm();
  }

  private async initializeForm() {
    try {
      // Ensure fresh data from backend
      await this.userSvc.refresh();
      await this.showSvc.refresh();
      await this.svc.refresh();
      
      this.users = this.userSvc.getAll();
      // Normalize all show IDs to numbers
      this.shows = this.showSvc.getAll().map(s => ({ ...s, id: Number(s.id), theatreId: Number(s.theatreId) }));
      this.futureShows = this.shows.filter(s => s.date >= this.minDate);

      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdit = this.route.snapshot.url.some(u => u.path === 'edit');
        this.id = Number(idParam);
        let b = this.svc.getById(this.id);
        // Normalize booking showId and userId to numbers if present
        if (b) {
          b = { ...b, showId: Number(b.showId), userId: Number(b.userId) };
          this.form.patchValue({ userId: b.userId, showId: b.showId, seats: b.seats, status: b.status });
          this.selectedShow = this.showSvc.getById(b!.showId) ?? this.shows.find(s => s.id === b!.showId);
        }
      }

      this.form.controls.showId.valueChanges.subscribe(id => {
        const showId = id !== null && id !== undefined ? Number(id) : undefined;
        this.selectedShow = showId ? this.shows.find(s => s.id === showId) : undefined;
      });

      this.formReady = true;
    } catch (e: any) {
      this.errorMsg = 'Failed to load form data: ' + (e?.message ?? 'Unknown error');
      console.error('BookingFormComponent initialization error:', e);
    }
  }

  invalid(ctrl: BookingFormControlName){ const c=this.form.controls[ctrl]; return (c.touched || c.dirty) && c.invalid; }

  async submit(){
    this.errorMsg=''; this.form.markAllAsTouched(); if(this.form.invalid) return;
    const val = this.form.value as Omit<Booking,'id'|'totalPrice'>;
    try {
      if(this.isEdit && this.id) await this.svc.update(this.id, { ...val, totalPrice: this.total });
      else await this.svc.create(val, this.selectedShow?.price);
      setTimeout(() => this.router.navigate(['/bookings']), 100);
    } catch(e:any){ this.errorMsg = e?.message ?? 'Error'; console.error('Booking error:', e); }
  }
}