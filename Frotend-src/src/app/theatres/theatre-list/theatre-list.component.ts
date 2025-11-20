import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Theatre, TheatreService } from '../../services/theatre.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-theatre-list',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center my-3">
      <h2 class="h5 m-0">Theatres</h2>
      <a class="btn btn-primary" routerLink="/theatres/new">+ Add Theatre</a>
    </div>

    <ng-container *ngIf="theatres.length > 0; else empty">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead><tr><th>ID</th><th>Name</th><th>City</th><th>Address</th><th style="width:220px;">Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of theatres">
              <td>{{t.id}}</td>
              <td><a [routerLink]="['/theatres', t.id]">{{t.name}}</a></td>
              <td>{{t.city}}</td>
              <td>{{t.address}}</td>
              <td>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/theatres', t.id]">View</a>
                <a class="btn btn-outline-secondary btn-sm me-1" [routerLink]="['/theatres', t.id, 'edit']">Edit</a>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(t.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <ng-template #empty>
      <div class="alert alert-info">No theatres found. Click <strong>+ Add Theatre</strong> to add one.</div>
    </ng-template>
  `
})
export class TheatreListComponent implements OnInit, OnDestroy {
  theatres: Theatre[]=[]; sub?:Subscription;
  constructor(private svc: TheatreService){}
  ngOnInit(){ this.sub=this.svc.list$.subscribe(list=>this.theatres=list); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }
  async delete(id:number){ if(confirm('Delete this theatre?')) await this.svc.delete(id); }
}