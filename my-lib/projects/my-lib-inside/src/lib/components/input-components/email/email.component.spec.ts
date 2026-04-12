import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailComponent } from './email.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

describe('EmailComponent', () => {
  let component: EmailComponent;
  let fixture: ComponentFixture<EmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailComponent);
    component = fixture.componentInstance;
    component.formControl = new FormControl('');
    component.name = 'email';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});