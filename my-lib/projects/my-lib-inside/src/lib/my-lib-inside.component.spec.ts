import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLibInsideComponent } from './my-lib-inside.component';

describe('MyLibInsideComponent', () => {
  let component: MyLibInsideComponent;
  let fixture: ComponentFixture<MyLibInsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLibInsideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyLibInsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
