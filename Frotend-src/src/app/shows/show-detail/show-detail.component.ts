import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Show, ShowService } from '../../services/show.service';
import { TheatreService } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-show-detail',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Show Details</h2>
      <a class="btn btn-outline-secondary" routerLink="/shows">Back</a>
    </div>
    <div *ngIf="show; else nf" class="card"><div class="card-body">
      <p><strong>ID:</strong> {{show.id}}</p>
      <p><strong>Movie:</strong> {{show.movieTitle}}</p>
      <p><strong>Theatre:</strong> {{theatreName}}</p>
      <p><strong>Date & Time:</strong> {{show.date}} {{show.time}}</p>
      <p><strong>Price:</strong> ₹ {{show.price}}</p>
      <p><strong>Seats Available:</strong> {{show.seatsAvailable}}</p>
      <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/shows', show.id, 'edit']">Edit</a>
    </div></div>
    <ng-template #nf><div class="alert alert-warning">Show not found.</div></ng-template>
  `
})
export class ShowDetailComponent implements OnInit {
  show?: Show; theatreName='Unknown';
  constructor(private route: ActivatedRoute, private svc: ShowService, private theatreSvc: TheatreService){}

  async ngOnInit(){
    try {
      await this.svc.refresh();
      await this.theatreSvc.refresh();
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.show = this.svc.getById(id);
      if (this.show) this.theatreName = this.theatreSvc.getById(this.show.theatreId)?.name ?? 'Unknown';
    } catch (e) {
      console.error('Failed to load show detail', e);
    }
  }
}