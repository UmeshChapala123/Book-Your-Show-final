import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" routerLink="/">BookYourShow</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navContent" class="collapse navbar-collapse">
        <!-- right aligned -->
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item"><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a></li>
          <li class="nav-item"><a routerLink="/users" routerLinkActive="active" class="nav-link">Users</a></li>
          <li class="nav-item"><a routerLink="/theatres" routerLinkActive="active" class="nav-link">Theatres</a></li>
          <li class="nav-item"><a routerLink="/shows" routerLinkActive="active" class="nav-link">Shows</a></li>
          <li class="nav-item"><a routerLink="/bookings" routerLinkActive="active" class="nav-link">Bookings</a></li>
        </ul>
      </div>
    </div>
  </nav>
  `
})
export class NavbarComponent {}