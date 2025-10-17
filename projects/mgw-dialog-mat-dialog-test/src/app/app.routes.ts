import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dialog',
    loadComponent: () => import('./dialog-test/dialog-test.component').then(c => c.DialogTestComponent)
  },
  {
    path: '',
    redirectTo: '/dialog',
    pathMatch: 'full'
  }
];
