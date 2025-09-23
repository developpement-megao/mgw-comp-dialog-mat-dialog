import { TestBed } from '@angular/core/testing';

import { NgxMgwDialogMatDialogService } from './ngx-mgw-dialog-mat-dialog.service';

describe('NgxMgwDialogMatDialogService', () => {
  let service: NgxMgwDialogMatDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMgwDialogMatDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
