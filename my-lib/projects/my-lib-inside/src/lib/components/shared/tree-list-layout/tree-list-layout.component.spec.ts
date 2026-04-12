import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeListLayoutComponent } from './tree-list-layout.component';

describe('TreeListLayoutComponent', () => {
  let component: TreeListLayoutComponent;
  let fixture: ComponentFixture<TreeListLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeListLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeListLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
