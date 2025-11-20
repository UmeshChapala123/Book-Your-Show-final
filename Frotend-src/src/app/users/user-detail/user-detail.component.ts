import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-user-detail',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">User Details</h2>
      <a class="btn btn-outline-secondary" routerLink="/users">Back</a>
    </div>
    <div *ngIf="user; else nf" class="card"><div class="card-body">
      <p><strong>ID:</strong> {{user.id}}</p>
      <p><strong>Name:</strong> {{user.name}}</p>
      <p><strong>Email:</strong> {{user.email}}</p>
      <p><strong>Phone:</strong> {{user.phone}}</p>
      <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/users', user.id, 'edit']">Edit</a>
    </div></div>
    <ng-template #nf><div class="alert alert-warning">User not found.</div></ng-template>
  `
})
export class UserDetailComponent implements OnInit {
  user?: User;
  constructor(private route: ActivatedRoute, private userSvc: UserService){}

  async ngOnInit(){
    try {
      await this.userSvc.refresh();
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.user = this.userSvc.getById(id);
    } catch (e) {
      console.error('Failed to load user detail', e);
    }
  }
}