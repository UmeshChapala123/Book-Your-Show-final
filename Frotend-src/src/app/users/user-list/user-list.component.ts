import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Users</h2>
      <a class="btn btn-primary" routerLink="/users/new">+ Add User</a>
    </div>

    <ng-container *ngIf="users.length > 0; else empty">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th style="width:220px;">Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{u.id}}</td>
              <td><a [routerLink]="['/users', u.id]">{{u.name}}</a></td>
              <td>{{u.email}}</td>
              <td>{{u.phone}}</td>
              <td>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/users', u.id]">View</a>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/users', u.id, 'edit']">Edit</a>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(u.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <ng-template #empty>
      <div class="alert alert-info">No users found. Click <strong>+ Add User</strong> to add one.</div>
    </ng-template>
  `
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  sub?: Subscription;

  constructor(private userSvc: UserService) {}
  ngOnInit(){ this.sub = this.userSvc.list$.subscribe(list=>this.users=list); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  async delete(id:number){
    if (confirm('Delete this user?')) await this.userSvc.delete(id);
  }
}