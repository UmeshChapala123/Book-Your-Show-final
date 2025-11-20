import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TheatreService, Theatre } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';

type TheatreFormControlName = 'name' | 'city' | 'address';

@Component({
  standalone: true,
  selector: 'app-theatre-form',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">{{ isEdit ? 'Edit Theatre' : 'Add Theatre' }}</h2>
      <a class="btn btn-outline-secondary" routerLink="/theatres">Back</a>
    </div>
    <div *ngIf="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>
    <form (ngSubmit)="submit()" [formGroup]="form" novalidate class="row g-3">
      <div class="col-12 col-md-6">
        <label class="form-label">Name</label>
        <input formControlName="name" class="form-control" [class.is-invalid]="invalid('name')">
        <div class="invalid-feedback">Name is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">City</label>
        <input formControlName="city" class="form-control" [class.is-invalid]="invalid('city')">
        <div class="invalid-feedback">City is required.</div>
      </div>
      <div class="col-12">
        <label class="form-label">Address</label>
        <input formControlName="address" class="form-control" [class.is-invalid]="invalid('address')">
        <div class="invalid-feedback">Address is required (min 5 characters).</div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ isEdit ? 'Save Changes' : 'Create Theatre' }}</button>
      </div>
    </form>
  `
})
export class TheatreFormComponent implements OnInit {
  isEdit=false; id?:number; errorMsg='';
  form = this.fb.group({
    name:['',[Validators.required]],
    city:['',[Validators.required]],
    address:['',[Validators.required, Validators.minLength(5)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: TheatreService
  ){
  }

  async ngOnInit(){
    try{
      await this.svc.refresh();
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdit = this.route.snapshot.url.some(u => u.path === 'edit');
        this.id = Number(idParam);
        const t = this.svc.getById(this.id);
        if (t) this.form.patchValue(t);
      }
    }catch(e){ console.error('Failed to initialize theatre form', e); }
  }

  invalid(ctrl: TheatreFormControlName){ const c=this.form.controls[ctrl]; return (c.touched || c.dirty) && c.invalid; }

  async submit(){
    this.errorMsg=''; this.form.markAllAsTouched(); if(this.form.invalid) return;
    const val=this.form.value as Omit<Theatre,'id'>;
    try{
      if(this.isEdit&&this.id) await this.svc.update(this.id,val);
      else await this.svc.create(val);
      this.router.navigate(['/theatres']);
    }catch(e:any){ this.errorMsg=e?.message ?? 'Error'; }
  }
}