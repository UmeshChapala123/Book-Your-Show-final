import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Theatre, TheatreService } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-theatre-detail',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Theatre Details</h2>
      <a class="btn btn-outline-secondary" routerLink="/theatres">Back</a>
    </div>
    <div *ngIf="theatre; else nf" class="card"><div class="card-body">
      <p><strong>ID:</strong> {{theatre.id}}</p>
      <p><strong>Name:</strong> {{theatre.name}}</p>
      <p><strong>City:</strong> {{theatre.city}}</p>
      <p><strong>Address:</strong> {{theatre.address}}</p>
      <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/theatres', theatre.id, 'edit']">Edit</a>
    </div></div>
    <ng-template #nf><div class="alert alert-warning">Theatre not found.</div></ng-template>
  `
})
export class TheatreDetailComponent implements OnInit {
  theatre?: Theatre;
  constructor(private route: ActivatedRoute, private svc: TheatreService){}

  async ngOnInit(){
    try {
      await this.svc.refresh();
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.theatre = this.svc.getById(id);
    } catch (e) {
      console.error('Failed to load theatre detail', e);
    }
  }
}