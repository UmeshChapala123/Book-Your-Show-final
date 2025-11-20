import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ShowService, Show } from '../../services/show.service';
import { TheatreService, Theatre } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';

function todayStr(){ const d=new Date(); const mm=(d.getMonth()+1).toString().padStart(2,'0'); const dd=d.getDate().toString().padStart(2,'0'); return `${d.getFullYear()}-${mm}-${dd}`; }
type ShowFormControlName = 'movieTitle' | 'theatreId' | 'date' | 'time' | 'price' | 'seatsAvailable';

@Component({
  standalone: true,
  selector: 'app-show-form',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">{{ isEdit ? 'Edit Show' : 'Add Show' }}</h2>
      <a class="btn btn-outline-secondary" routerLink="/shows">Back</a>
    </div>
    <div *ngIf="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>
    <form (ngSubmit)="submit()" [formGroup]="form" novalidate class="row g-3">
      <div class="col-12 col-md-6">
        <label class="form-label">Movie Title</label>
        <input formControlName="movieTitle" class="form-control" [class.is-invalid]="invalid('movieTitle')">
        <div class="invalid-feedback">Movie title is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Theatre</label>
        <select formControlName="theatreId" class="form-select" [class.is-invalid]="invalid('theatreId')">
          <option [ngValue]="null" disabled>Select theatre</option>
          <option *ngFor="let t of theatres" [ngValue]="t.id">{{t.name}} ({{t.city}})</option>
        </select>
        <div class="invalid-feedback">Theatre is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Date</label>
        <input type="date" formControlName="date" class="form-control" [class.is-invalid]="invalid('date')" [min]="minDate">
        <div class="invalid-feedback">Date is required and cannot be in the past.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Time</label>
        <input type="time" formControlName="time" class="form-control" [class.is-invalid]="invalid('time')">
        <div class="invalid-feedback">Time is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Price (₹)</label>
        <input type="number" formControlName="price" class="form-control" [class.is-invalid]="invalid('price')">
        <div class="invalid-feedback">Price must be 0 or more.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Seats Available</label>
        <input type="number" formControlName="seatsAvailable" class="form-control" [class.is-invalid]="invalid('seatsAvailable')">
        <div class="invalid-feedback">Seats must be 0 or more.</div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ isEdit ? 'Save Changes' : 'Create Show' }}</button>
      </div>
    </form>
  `
})
export class ShowFormComponent implements OnInit {
  isEdit=false; id?:number; theatres: Theatre[]=[]; errorMsg=''; minDate=todayStr();
  form = this.fb.group({
    movieTitle:['',[Validators.required]],
    theatreId:[null as unknown as number,[Validators.required]],
    date:['',[Validators.required]],
    time:['',[Validators.required]],
    price:[0,[Validators.required, Validators.min(0)]],
    seatsAvailable:[0,[Validators.required, Validators.min(0)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: ShowService,
    private theatreSvc: TheatreService
  ){
  }

  async ngOnInit(){
    try {
      await this.theatreSvc.refresh();
      await this.svc.refresh();
      this.theatres = this.theatreSvc.getAll();

      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdit = this.route.snapshot.url.some(u => u.path === 'edit');
        this.id = Number(idParam);
        const s = this.svc.getById(this.id);
        if (s) this.form.patchValue(s);
      }
    } catch (e) {
      console.error('Failed to initialize show form', e);
      this.errorMsg = 'Failed to load form data';
    }
  }

  invalid(ctrl: ShowFormControlName){ const c=this.form.controls[ctrl]; return (c.touched || c.dirty) && c.invalid; }

  async submit(){
    this.errorMsg=''; this.form.markAllAsTouched(); if(this.form.invalid) return;
    const val=this.form.value as Omit<Show,'id'>;
    try{
      if(this.isEdit&&this.id) await this.svc.update(this.id,val);
      else await this.svc.create(val);
      this.router.navigate(['/shows']);
    }catch(e:any){ this.errorMsg=e?.message ?? 'Error'; }
  }
}