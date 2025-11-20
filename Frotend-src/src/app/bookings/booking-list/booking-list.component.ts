import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Booking, BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { ShowService } from '../../services/show.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-booking-list',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Bookings</h2>
      <a class="btn btn-primary" routerLink="/bookings/new">+ New Booking</a>
    </div>

    <ng-container *ngIf="bookings.length > 0; else empty">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead><tr><th>ID</th><th>User</th><th>Show</th><th>Seats</th><th>Total</th><th>Status</th><th style="width:220px;">Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let b of bookings">
              <td>{{b.id}}</td>
              <td>{{userName(b.userId)}}</td>
              <td>{{showTitle(b.showId)}}</td>
              <td>{{b.seats}}</td>
              <td>₹ {{b.totalPrice}}</td>
              <td>{{b.status}}</td>
              <td>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/bookings', b.id]">View</a>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/bookings', b.id, 'edit']">Edit</a>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(b.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <ng-template #empty>
      <div class="alert alert-info">No bookings found. Click <strong>+ New Booking</strong> to create one.</div>
    </ng-template>
  `
})
export class BookingListComponent implements OnInit, OnDestroy {
  bookings: Booking[]=[]; sub?:Subscription;

  constructor(private svc: BookingService, private userSvc: UserService, private showSvc: ShowService){}

  userName=(id:number)=> this.userSvc.getById(id)?.name ?? 'Unknown';
  showTitle=(id:number)=> this.showSvc.getById(id)?.movieTitle ?? 'Unknown';
  async ngOnInit(){
    // ensure latest server-side data so lookups for user/show are accurate
    await this.userSvc.refresh();
    await this.showSvc.refresh();
    await this.svc.refresh();
    this.sub = this.svc.list$.subscribe(list => this.bookings = list);
  }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  async delete(id:number){ if (confirm('Delete this booking?')) await this.svc.delete(id); }
}