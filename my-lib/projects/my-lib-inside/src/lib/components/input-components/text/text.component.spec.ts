import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextComponent } from './text.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    component.formControl = new FormControl('');
    component.name = 'text';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});