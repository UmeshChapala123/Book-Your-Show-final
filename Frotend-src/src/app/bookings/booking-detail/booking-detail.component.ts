import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Booking, BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { ShowService } from '../../services/show.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-booking-detail',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Booking Details</h2>
      <a class="btn btn-outline-secondary" routerLink="/bookings">Back</a>
    </div>
    <div *ngIf="booking; else nf" class="card"><div class="card-body">
      <p><strong>ID:</strong> {{booking.id}}</p>
      <p><strong>User:</strong> {{userName}}</p>
      <p><strong>Show:</strong> {{showTitle}}</p>
      <p><strong>Seats:</strong> {{booking.seats}}</p>
      <p><strong>Total Price:</strong> ₹ {{booking.totalPrice}}</p>
      <p><strong>Status:</strong> {{booking.status}}</p>
      <div class="mt-3 pt-3 border-top">
        <a class="btn btn-outline-secondary btn-sm me-2" [routerLink]="['/bookings', booking.id, 'edit']">Edit</a>
        <button class="btn btn-outline-danger btn-sm" (click)="delete()">Delete</button>
      </div>
    </div></div>
    <ng-template #nf><div class="alert alert-warning">Booking not found.</div></ng-template>
  `
})
export class BookingDetailComponent implements OnInit {
  booking?: Booking; userName=''; showTitle='';
  constructor(
    private route: ActivatedRoute,
    private svc: BookingService,
    private userSvc: UserService,
    private showSvc: ShowService,
    private router: Router
  ){}

  async ngOnInit() {
    try {
      await this.svc.refresh();
      await this.userSvc.refresh();
      await this.showSvc.refresh();
      this.loadBooking();
    } catch (e) {
      console.error('Failed to load booking detail data', e);
    }
  }

  private loadBooking() {
    const id=Number(this.route.snapshot.paramMap.get('id'));
    this.booking = this.svc.getById(id);
    if(this.booking){
      this.userName = this.userSvc.getById(this.booking.userId)?.name ?? 'Unknown';
      this.showTitle = this.showSvc.getById(this.booking.showId)?.movieTitle ?? 'Unknown';
    }
  }

  async delete() {
    if (!this.booking) return;
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await this.svc.delete(this.booking.id);
        this.router.navigate(['/bookings']);
      } catch (e: any) {
        alert('Failed to delete: ' + (e?.message ?? 'Unknown error'));
      }
    }
  }
}