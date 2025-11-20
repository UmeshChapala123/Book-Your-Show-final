import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { UserListComponent } from './users/user-list/user-list.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { UserFormComponent } from './users/user-form/user-form.component';

import { TheatreListComponent } from './theatres/theatre-list/theatre-list.component';
import { TheatreDetailComponent } from './theatres/theatre-detail/theatre-detail.component';
import { TheatreFormComponent } from './theatres/theatre-form/theatre-form.component';

import { ShowListComponent } from './shows/show-list/show-list.component';
import { ShowDetailComponent } from './shows/show-detail/show-detail.component';
import { ShowFormComponent } from './shows/show-form/show-form.component';

import { BookingListComponent } from './bookings/booking-list/booking-list.component';
import { BookingDetailComponent } from './bookings/booking-detail/booking-detail.component';
import { BookingFormComponent } from './bookings/booking-form/booking-form.component';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },

  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: 'users/:id/edit', component: UserFormComponent },

  { path: 'theatres', component: TheatreListComponent },
  { path: 'theatres/new', component: TheatreFormComponent },
  { path: 'theatres/:id', component: TheatreDetailComponent },
  { path: 'theatres/:id/edit', component: TheatreFormComponent },

  { path: 'shows', component: ShowListComponent },
  { path: 'shows/new', component: ShowFormComponent },
  { path: 'shows/:id', component: ShowDetailComponent },
  { path: 'shows/:id/edit', component: ShowFormComponent },

  { path: 'bookings', component: BookingListComponent },
  { path: 'bookings/new', component: BookingFormComponent },
  { path: 'bookings/:id', component: BookingDetailComponent },
  { path: 'bookings/:id/edit', component: BookingFormComponent },

  { path: '**', redirectTo: '' }
];