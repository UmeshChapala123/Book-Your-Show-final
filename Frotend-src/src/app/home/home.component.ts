import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { TheatreService } from '../services/theatre.service';
import { ShowService } from '../services/show.service';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="h4 my-3">Dashboard</h1>
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card"><div class="card-body">
          <div class="text-muted">Users</div>
          <div class="h2 m-0">{{ stats.users }}</div>
        </div></div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card"><div class="card-body">
          <div class="text-muted">Theatres</div>
          <div class="h2 m-0">{{ stats.theatres }}</div>
        </div></div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card"><div class="card-body">
          <div class="text-muted">Shows</div>
          <div class="h2 m-0">{{ stats.shows }}</div>
        </div></div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card"><div class="card-body">
          <div class="text-muted">Revenue</div>
          <div class="h2 m-0">₹ {{ stats.revenue }}</div>
        </div></div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  sub?: Subscription;
  stats = { users: 0, theatres: 0, shows: 0, revenue: 0 };

  constructor(
    private users: UserService,
    private theatres: TheatreService,
    private shows: ShowService,
    private bookings: BookingService
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([
      this.users.list$,
      this.theatres.list$,
      this.shows.list$,
      this.bookings.list$
    ]).subscribe(([u, t, s, b]) => {
      const revenue = b.filter(x => x.status === 'CONFIRMED')
                       .reduce((sum, x) => sum + x.totalPrice, 0);
      this.stats = { users: u.length, theatres: t.length, shows: s.length, revenue };
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}