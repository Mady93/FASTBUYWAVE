import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeLocalComponent } from './datetime-local.component';

describe('DatetimeLocalComponent', () => {
  let component: DatetimeLocalComponent;
  let fixture: ComponentFixture<DatetimeLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatetimeLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatetimeLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
