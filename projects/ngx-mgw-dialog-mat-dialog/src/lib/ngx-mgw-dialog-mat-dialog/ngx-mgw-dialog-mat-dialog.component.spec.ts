import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMgwDialogMatDialogComponent } from './ngx-mgw-dialog-mat-dialog.component';

describe('NgxMgwDialogMatDialogComponent', () => {
  let component: NgxMgwDialogMatDialogComponent;
  let fixture: ComponentFixture<NgxMgwDialogMatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxMgwDialogMatDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxMgwDialogMatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
