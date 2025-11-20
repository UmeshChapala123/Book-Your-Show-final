import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';

type UserFormControlName = 'name' | 'email' | 'phone';

@Component({
  standalone: true,
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">{{ isEdit ? 'Edit User' : 'Add User' }}</h2>
      <a class="btn btn-outline-secondary" routerLink="/users">Back</a>
    </div>
    <div *ngIf="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>
    <form (ngSubmit)="submit()" [formGroup]="form" novalidate class="row g-3">
      <div class="col-12 col-md-6">
        <label class="form-label">Name</label>
        <input formControlName="name" class="form-control" [class.is-invalid]="invalid('name')">
        <div class="invalid-feedback">Name is required (min 2 characters).</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Email</label>
        <input formControlName="email" type="email" class="form-control" [class.is-invalid]="invalid('email')">
        <div class="invalid-feedback">Valid unique email is required.</div>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Phone</label>
        <input formControlName="phone" class="form-control" [class.is-invalid]="invalid('phone')" placeholder="10-digit phone">
        <div class="invalid-feedback">Phone must be exactly 10 digits.</div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">{{ isEdit ? 'Save Changes' : 'Create User' }}</button>
      </div>
    </form>
  `
})
export class UserFormComponent implements OnInit {
  isEdit = false;
  userId?: number;
  errorMsg = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userSvc: UserService
  ) {
  }

  async ngOnInit(){
    try{
      await this.userSvc.refresh();
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdit = this.route.snapshot.url.some(u => u.path === 'edit');
        this.userId = Number(idParam);
        const user = this.userSvc.getById(this.userId);
        if (user) this.form.patchValue(user);
      }
    }catch(e){ console.error('Failed to initialize user form', e); }
  }

  invalid(ctrl: UserFormControlName) {
    const c = this.form.controls[ctrl];
    return (c.touched || c.dirty) && c.invalid;
  }

  async submit() {
    this.errorMsg = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = {
      name: (this.form.value.name ?? '').trim(),
      email: (this.form.value.email ?? '').trim(),
      phone: (this.form.value.phone ?? '').trim()
    } as Omit<User, 'id'>;

    try {
      if (this.isEdit && this.userId) await this.userSvc.update(this.userId, value);
      else await this.userSvc.create(value);
      this.router.navigate(['/users']);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error';
    }
  }
}