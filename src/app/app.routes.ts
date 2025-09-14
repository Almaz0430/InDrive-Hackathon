import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/car-analyzer',
    pathMatch: 'full'
  },
  {
    path: 'car-analyzer',
    loadComponent: () => import('./car-photo-analyzer/car-photo-analyzer.component').then(m => m.CarPhotoAnalyzerComponent)
  }
];
