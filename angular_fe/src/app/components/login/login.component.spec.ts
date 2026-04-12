import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { of, throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';

// ============================================
// MOCK DynamicFormComponent
// ============================================
@Component({
  selector: 'lib-dynamic-form',
  template: '',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
})
class MockDynamicFormComponent {
  @Input() formConfig: any = { fields: [], buttons: [] };
  @Input() formTitle: string = '';
  @Input() layout: string = 'card';
  @Input() formClass: string = '';
  @Input() cardClass: string = '';
  @Input() backdrop: boolean = true;
  @Input() backdropBlur: boolean = true;
  @Input() enableSocialLogin: boolean = false;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formStatusChange = new EventEmitter<any>();
  @Output() fieldValueChange = new EventEmitter<any>();
  @Output() register = new EventEmitter<void>();
  @Output() login = new EventEmitter<void>();
  @Output() googleSignin = new EventEmitter<void>();
  @Output() buttonClick = new EventEmitter<any>();

  resetForm(): void {}
}

// ============================================
// MOCK SERVICES
// ============================================
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockAuthGoogleService {
  login = jasmine.createSpy('login').and.returnValue(of({}));
  pub_init = jasmine.createSpy('pub_init');
}

class MockFaIconLibrary {
  addIcons = jasmine.createSpy('addIcons');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: MockRouter;
  let mockAuthService: MockAuthGoogleService;
  let mockIconLibrary: MockFaIconLibrary;

  beforeEach(async () => {
    mockRouter = new MockRouter();
    mockAuthService = new MockAuthGoogleService();
    mockIconLibrary = new MockFaIconLibrary();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthGoogleService, useValue: mockAuthService },
        { provide: FaIconLibrary, useValue: mockIconLibrary },
      ],
    })
      .overrideComponent(LoginComponent, {
        set: {
          imports: [CommonModule, MockDynamicFormComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockRouter.navigate.calls.reset();
    mockAuthService.login.calls.reset();
    mockAuthService.pub_init.calls.reset();
    mockIconLibrary.addIcons.calls.reset();
  });

  // ============================================
  // CREATION AND DEFAULT VALUES TESTS
  // ============================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.logo_).toBe('/logo11.png');
    expect(component.logo).toBe('/image.png');
    expect(component.formTitle).toBe('Sign In');
    expect(component.formClass).toBe('my-form');
    expect(component.cardClass).toBe('my-card');
    expect(component.backdrop).toBe(true);
    expect(component.backdropBlur).toBe(true);
    expect(component.layout).toBe('card');
    expect(component.enableSocialLogin).toBe(true);
    expect(component.formStatus).toEqual({ valid: false, errors: {} });
  });

  // ============================================
  // FORM CONFIGURATION TESTS
  // ============================================

  it('should have formConf with email and password fields', () => {
    expect(component.formConf.fields.length).toBe(2);
    expect(component.formConf.fields[0].name).toBe('email');
    expect(component.formConf.fields[1].name).toBe('password');
    expect(component.formConf.buttons!.length).toBe(3);
  });

  it('should have email field with required and email validators', () => {
    const emailField = component.formConf.fields[0];
    expect(emailField.validators).toContain(jasmine.any(Function));
    expect(emailField.required).toBe(true);
    expect(emailField.errorMessages).toBeDefined();
    expect(emailField.errorMessages!['required']).toBe('Email address is required');
    expect(emailField.errorMessages!['email']).toBe('Please enter a valid email address');
  });

  it('should have password field with required, minLength and pattern validators', () => {
    const passwordField = component.formConf.fields[1];
    expect(passwordField.validators).toContain(jasmine.any(Function));
    expect(passwordField.required).toBe(true);
    expect(passwordField.errorMessages).toBeDefined();
    expect(passwordField.errorMessages!['required']).toBe('Password is required');
    expect(passwordField.errorMessages!['minlength']).toBe('Password must be at least 8 characters long');
    expect(passwordField.errorMessages!['pattern']).toBe('Password must include at least one number, one lowercase letter, one uppercase letter, and one special character');
  });

  // ============================================
  // BUTTONS CONFIGURATION TESTS
  // ============================================

  it('should have submit button with correct configuration', () => {
    const submitButton = component.formConf.buttons?.find(b => b.id === 'submit');
    expect(submitButton).toBeDefined();
    expect(submitButton?.label).toBe('Sign in');
    expect(submitButton?.type).toBe('submit');
  });

  it('should have refresh button with correct configuration', () => {
    const refreshButton = component.formConf.buttons?.find(b => b.id === 'refresh');
    expect(refreshButton).toBeDefined();
    expect(refreshButton?.label).toBe('Reset');
    expect(refreshButton?.type).toBe('button');
  });

  it('should have register button with correct configuration', () => {
    const registerButton = component.formConf.buttons?.find(b => b.id === 'register');
    expect(registerButton).toBeDefined();
    expect(registerButton?.label).toBe('Go to Sign Up');
    expect(registerButton?.type).toBe('button');
  });

  // ============================================
  // NGONINIT TESTS
  // ============================================

  it('should add icons to library on init', () => {
    expect(mockIconLibrary.addIcons).toHaveBeenCalledTimes(2);
  });

  // ============================================
  // NAVIGATION TESTS
  // ============================================

  it('should navigate to /register when onRegister is called', () => {
    component.onRegister();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
  });

  // ============================================
  // FORM EVENT HANDLERS TESTS
  // ============================================

  it('should log field value change', () => {
    spyOn(console, 'log');
    const mockFormGroup = {
      get: jasmine.createSpy('get'),
      value: { email: 'test@example.com' },
    };
    const event = {
      fieldName: 'email',
      value: 'test@example.com',
      form: mockFormGroup as any,
    };
    component.onFieldValueChange(event);
  });

  it('should update formStatus when onFormStatusChange is called', () => {
    const status = { valid: true, errors: {} };
    component.onFormStatusChange(status);
    expect(component.formStatus).toEqual(status);
  });

  it('should log form status', () => {
    spyOn(console, 'log');
    const status = { valid: true, errors: {} };
    component.onFormStatusChange(status);
    expect(console.log).toHaveBeenCalledWith('State of form parent:', true);
  });

  // ============================================
  // LOGIN SUBMIT TESTS
  // ============================================

  it('should NOT call login service if form is invalid', () => {
    component.formStatus = { valid: false, errors: {} };
    const formData = { email: 'test@example.com', password: 'password123' };
    component.onLoginSubmit(formData);
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should call login service and navigate to dashboard on success', fakeAsync(() => {
    component.formStatus = { valid: true, errors: {} };
    const formData = { email: 'test@example.com', password: 'Password123!' };
    mockAuthService.login.and.returnValue(of({ success: true }));

    component.dynamicFormComponent = {
      resetForm: jasmine.createSpy('resetForm'),
    } as any;

    component.onLoginSubmit(formData);
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith(formData);
    expect(mockAuthService.pub_init).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.dynamicFormComponent.resetForm).toHaveBeenCalled();
  }));

  it('should log error on login failure', fakeAsync(() => {
    spyOn(console, 'error');
    component.formStatus = { valid: true, errors: {} };
    const formData = { email: 'test@example.com', password: 'Password123!' };
    const errorResponse = { error: 'Invalid credentials' };
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.onLoginSubmit(formData);
    tick();

    expect(console.error).toHaveBeenCalledWith('Login failed', errorResponse);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  // ============================================
  // TEMPLATE INTEGRATION TESTS
  // ============================================

  it('should render dynamic form component', () => {
    const dynamicFormElement = fixture.nativeElement.querySelector('lib-dynamic-form');
    expect(dynamicFormElement).toBeTruthy();
  });

  it('should display logo image', () => {
    const logoImg = fixture.nativeElement.querySelector('img[alt="logo"]');
    expect(logoImg).toBeTruthy();
    expect(logoImg.src).toContain('image.png');
  });

  // ============================================
  // EVENT EMITTER TESTS
  // ============================================

  it('should handle formSubmit event from dynamic form', () => {
    spyOn(component, 'onLoginSubmit');
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    const testData = { email: 'test@example.com', password: 'Password123!' };
    dynamicFormDebug.componentInstance.formSubmit.emit(testData);
    expect(component.onLoginSubmit).toHaveBeenCalledWith(testData);
  });

  it('should handle formStatusChange event from dynamic form', () => {
    spyOn(component, 'onFormStatusChange');
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    const testStatus = { valid: true, errors: {} };
    dynamicFormDebug.componentInstance.formStatusChange.emit(testStatus);
    expect(component.onFormStatusChange).toHaveBeenCalledWith(testStatus);
  });

  it('should handle fieldValueChange event from dynamic form', () => {
    spyOn(component, 'onFieldValueChange');
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    const mockFormGroup = { get: jasmine.createSpy('get'), value: {} };
    const testEvent = { fieldName: 'email', value: 'test@example.com', form: mockFormGroup as any };
    dynamicFormDebug.componentInstance.fieldValueChange.emit(testEvent);
    expect(component.onFieldValueChange).toHaveBeenCalledWith(testEvent);
  });

  it('should handle register event from dynamic form', () => {
    spyOn(component, 'onRegister');
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    dynamicFormDebug.componentInstance.register.emit();
    expect(component.onRegister).toHaveBeenCalled();
  });

  // ============================================
  // BINDING TESTS
  // ============================================

  it('should bind formConfig to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    expect(dynamicFormDebug.componentInstance.formConfig).toBe(component.formConf);
  });

  it('should bind formTitle to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    expect(dynamicFormDebug.componentInstance.formTitle).toBe(component.formTitle);
  });

  it('should bind enableSocialLogin to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(By.css('lib-dynamic-form'));
    expect(dynamicFormDebug.componentInstance.enableSocialLogin).toBe(component.enableSocialLogin);
  });
});