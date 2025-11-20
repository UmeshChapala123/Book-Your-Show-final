import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Show, ShowService } from '../../services/show.service';
import { TheatreService } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-show-list',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Shows</h2>
      <a class="btn btn-primary" routerLink="/shows/new">+ Add Show</a>
    </div>

    <ng-container *ngIf="shows.length > 0; else empty">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead><tr><th>ID</th><th>Movie</th><th>Theatre</th><th>Date</th><th>Time</th><th>Price</th><th>Seats</th><th style="width:220px;">Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of shows">
              <td>{{s.id}}</td>
              <td><a [routerLink]="['/shows', s.id]">{{s.movieTitle}}</a></td>
              <td>{{ theatreName(s.theatreId) }}</td>
              <td>{{s.date}}</td>
              <td>{{s.time}}</td>
              <td>₹ {{s.price}}</td>
              <td>{{s.seatsAvailable}}</td>
              <td>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/shows', s.id]">View</a>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/shows', s.id, 'edit']">Edit</a>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(s.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <ng-template #empty>
      <div class="alert alert-info">No shows found. Click <strong>+ Add Show</strong> to add one.</div>
    </ng-template>
  `
})
export class ShowListComponent implements OnInit, OnDestroy {
  shows: Show[]=[]; sub?: Subscription;
  theatreName=(id:number|string)=> this.theatreSvc.getById(id)?.name ?? 'Unknown';

  constructor(private svc: ShowService, private theatreSvc: TheatreService){}

  async ngOnInit(){
    // ensure theatre list and show list are fresh before subscribing
    await this.theatreSvc.refresh();
    await this.svc.refresh();
    this.sub = this.svc.list$.subscribe(list => this.shows = list);
  }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  async delete(id:number){ if (confirm('Delete this show?')) await this.svc.delete(id); }
}