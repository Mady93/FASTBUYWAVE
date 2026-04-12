import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RegisterProjectComponent } from './register-project.component';
import { Router } from '@angular/router';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { of, throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FieldChangeEvent } from 'my-lib-inside';

// ============================================
// MOCK DEL COMPONENTE DynamicFormComponent
// ============================================
@Component({
  selector: 'lib-dynamic-form',
  template: '',
  standalone: true,
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
  @Output() fieldValueChange = new EventEmitter<FieldChangeEvent>();
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
  register = jasmine.createSpy('register').and.returnValue(of({}));
  initiateGoogleLogin = jasmine.createSpy('initiateGoogleLogin');
}

class MockFaIconLibrary {
  addIcons = jasmine.createSpy('addIcons');
}

describe('RegisterProjectComponent', () => {
  let component: RegisterProjectComponent;
  let fixture: ComponentFixture<RegisterProjectComponent>;
  let mockRouter: MockRouter;
  let mockAuthService: MockAuthGoogleService;
  let mockIconLibrary: MockFaIconLibrary;

  beforeEach(async () => {
    mockRouter = new MockRouter();
    mockAuthService = new MockAuthGoogleService();
    mockIconLibrary = new MockFaIconLibrary();

    await TestBed.configureTestingModule({
      imports: [RegisterProjectComponent, MockDynamicFormComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthGoogleService, useValue: mockAuthService },
        { provide: FaIconLibrary, useValue: mockIconLibrary },
      ],
    })
      .overrideComponent(RegisterProjectComponent, {
        set: {
          imports: [
            CommonModule,
            MockDynamicFormComponent,
            FormsModule,
            ReactiveFormsModule,
            FontAwesomeModule,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockRouter.navigate.calls.reset();
    mockAuthService.register.calls.reset();
    mockAuthService.initiateGoogleLogin.calls.reset();
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
    expect(component.formTitle).toBe('Registration');
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

  it('should have formConf with email, password and repeatPassword fields', () => {
    expect(component.formConf.fields.length).toBe(3);
    expect(component.formConf.fields[0].name).toBe('email');
    expect(component.formConf.fields[1].name).toBe('password');
    expect(component.formConf.fields[2].name).toBe('repeatPassword');
    expect(component.formConf.buttons?.length).toBe(4);
  });

  it('should have email field with required and email validators', () => {
    const emailField = component.formConf.fields[0];
    expect(emailField.validators).toContain(jasmine.any(Function));
    expect(emailField.required).toBe(true);
    expect(emailField.errorMessages).toBeDefined();
    expect(emailField.errorMessages!['required']).toBe(
      'Email address is required',
    );
    expect(emailField.errorMessages!['email']).toBe(
      'Please enter a valid email address',
    );
  });

  it('should have password field with required, minLength and pattern validators', () => {
    const passwordField = component.formConf.fields[1];
    expect(passwordField.validators).toContain(jasmine.any(Function));
    expect(passwordField.required).toBe(true);
    expect(passwordField.errorMessages).toBeDefined();
    expect(passwordField.errorMessages!['required']).toBe(
      'Password is required',
    );
    expect(passwordField.errorMessages!['minlength']).toBe(
      'Password must be at least 8 characters long',
    );
    expect(passwordField.errorMessages!['pattern']).toBe(
      'Password must include at least one number, one lowercase letter, one uppercase letter, and one special character',
    );
  });

  it('should have repeatPassword field with required validator', () => {
    const repeatPasswordField = component.formConf.fields[2];
    expect(repeatPasswordField.validators).toContain(jasmine.any(Function));
    expect(repeatPasswordField.required).toBe(true);
    expect(repeatPasswordField.errorMessages).toBeDefined();
    expect(repeatPasswordField.errorMessages!['required']).toBe(
      'Password confirmation is required',
    );
    expect(repeatPasswordField.errorMessages!['mismatch']).toBe(
      'Passwords do not match',
    );
  });

  // ============================================
  // BUTTONS CONFIGURATION TESTS
  // ============================================

  it('should have submit button with correct configuration', () => {
    const buttons = component.formConf.buttons;
    expect(buttons).toBeDefined();
    const submitButton = buttons!.find((b) => b.id === 'submit');
    expect(submitButton).toBeDefined();
    expect(submitButton?.label).toBe('Sign up');
    expect(submitButton?.type).toBe('submit');
    expect(submitButton?.icon).toBeDefined();
  });

  it('should have refresh button with correct configuration', () => {
    const buttons = component.formConf.buttons;
    expect(buttons).toBeDefined();
    const refreshButton = buttons!.find((b) => b.id === 'refresh');
    expect(refreshButton).toBeDefined();
    expect(refreshButton?.label).toBe('Reset');
    expect(refreshButton?.type).toBe('button');
    expect(refreshButton?.icon).toBeDefined();
  });

  it('should have login button with correct configuration', () => {
    const buttons = component.formConf.buttons;
    expect(buttons).toBeDefined();
    const loginButton = buttons!.find((b) => b.id === 'login');
    expect(loginButton).toBeDefined();
    expect(loginButton?.label).toBe('Go to Sign In with Email');
    expect(loginButton?.type).toBe('button');
    expect(loginButton?.icon).toBeDefined();
  });

  it('should have google-signin button with correct configuration', () => {
    const buttons = component.formConf.buttons;
    expect(buttons).toBeDefined();
    const googleButton = buttons!.find((b) => b.id === 'google-signin');
    expect(googleButton).toBeDefined();
    expect(googleButton?.label).toBe('Sign in with Google');
    expect(googleButton?.type).toBe('button');
    expect(googleButton?.icon).toBeDefined();
  });

  // ============================================
  // PASSWORD MATCH VALIDATOR TESTS
  // ============================================

  it('should return null when passwords match', () => {
    const mockFormGroup = {
      get: jasmine.createSpy('get').and.callFake((key: string) => ({
        value: key === 'password' ? 'Password123!' : 'Password123!',
        setErrors: jasmine.createSpy('setErrors'),
      })),
    } as any;

    const result = component.passwordMatchValidator(mockFormGroup);
    expect(result).toBeNull();
  });

  it('should return mismatch error when passwords do not match', () => {
    const mockSetErrors = jasmine.createSpy('setErrors');
    const mockFormGroup = {
      get: jasmine.createSpy('get').and.callFake((key: string) => ({
        value: key === 'password' ? 'Password123!' : 'DifferentPassword123!',
        setErrors: mockSetErrors,
      })),
    } as any;

    const result = component.passwordMatchValidator(mockFormGroup);
    expect(result).toEqual({ mismatch: true });
    expect(mockSetErrors).toHaveBeenCalledWith({ mismatch: true });
  });

  // ============================================
  // FORM VALIDATOR INTEGRATION TESTS
  // ============================================

  it('should have formValidators array containing passwordMatchValidator', () => {
    expect(component.formConf.formValidators).toBeDefined();
    expect(component.formConf.formValidators!.length).toBe(1);
    // Verifica che sia una funzione
    expect(typeof component.formConf.formValidators![0]).toBe('function');
    // Verifica il nome della funzione
    expect(component.formConf.formValidators![0].name).toBe(
      'bound passwordMatchValidator',
    );
  });

  // ============================================
  // NGONINIT TESTS
  // ============================================

  it('should add icons to library on init', () => {
    expect(mockIconLibrary.addIcons).toHaveBeenCalledTimes(4);
  });

  // ============================================
  // NAVIGATION TESTS
  // ============================================

  it('should navigate to /login when login is called', () => {
    component.login();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to /login when login is called with correct route', () => {
    component.login();
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate.calls.first().args[0]).toEqual(['/login']);
  });

  it('should call initiateGoogleLogin when onGoogleSignIn is called', () => {
    component.onGoogleSignIn();
    expect(mockAuthService.initiateGoogleLogin).toHaveBeenCalled();
    expect(mockAuthService.initiateGoogleLogin).toHaveBeenCalledTimes(1);
  });

  // ============================================
  // FORM EVENT HANDLERS TESTS
  // ============================================

  it('should log field value change with correct parameters', () => {
    spyOn(console, 'log');
    const event = {
      fieldName: 'email',
      value: 'test@example.com',
      form: null as any,
    };
    component.onFieldValueChange(event);
  });

  it('should log field value change for password field', () => {
    spyOn(console, 'log');
    const event = {
      fieldName: 'password',
      value: 'newPassword123!',
      form: null as any,
    };
    component.onFieldValueChange(event);
  });

  it('should update formStatus when onFormStatusChange is called', () => {
    const status = { valid: true, errors: {} };
    component.onFormStatusChange(status);
    expect(component.formStatus).toEqual(status);
  });

  it('should update formStatus with errors when onFormStatusChange is called with errors', () => {
    const status = { valid: false, errors: { email: 'Invalid email' } };
    component.onFormStatusChange(status);
    expect(component.formStatus).toEqual(status);
    expect(component.formStatus.valid).toBe(false);
    expect(component.formStatus.errors).toEqual({ email: 'Invalid email' });
  });

  // ============================================
  // REGISTER SUBMIT TESTS
  // ============================================

  it('should NOT call register service if form is invalid', () => {
    component.formStatus = { valid: false, errors: {} };
    const formData = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
    };

    component.onRegisterSubmit(formData);

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should NOT call register service if form is invalid with specific errors', () => {
    component.formStatus = { valid: false, errors: { email: 'Required' } };
    const formData = { email: '', password: '', repeatPassword: '' };

    component.onRegisterSubmit(formData);

    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should call register service and navigate to login on success', fakeAsync(() => {
    component.formStatus = { valid: true, errors: {} };
    const formData = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
    };
    mockAuthService.register.and.returnValue(of({ success: true }));

    component.dynamicFormComponent = {
      resetForm: jasmine.createSpy('resetForm'),
    } as any;

    component.onRegisterSubmit(formData);
    tick();

    expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.dynamicFormComponent.resetForm).toHaveBeenCalled();
  }));

  it('should send only email and password to register service (not repeatPassword)', fakeAsync(() => {
    component.formStatus = { valid: true, errors: {} };
    const formData = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'DifferentPassword!',
      extraField: 'extra',
    };
    mockAuthService.register.and.returnValue(of({ success: true }));

    component.dynamicFormComponent = {
      resetForm: jasmine.createSpy('resetForm'),
    } as any;

    component.onRegisterSubmit(formData);
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(mockAuthService.register).not.toHaveBeenCalledWith(
      jasmine.objectContaining({
        repeatPassword: jasmine.anything(),
      }),
    );
  }));

  it('should handle register error without throwing and not navigate', fakeAsync(() => {
    spyOn(console, 'error');
    component.formStatus = { valid: true, errors: {} };
    const formData = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
    };
    const errorResponse = { error: 'Registration failed', status: 400 };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.onRegisterSubmit(formData);
    tick();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  it('should not call resetForm if dynamicFormComponent is undefined on error', fakeAsync(() => {
    component.formStatus = { valid: true, errors: {} };
    const formData = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
    };
    mockAuthService.register.and.returnValue(
      throwError(() => ({ error: 'Failed' })),
    );

    component.dynamicFormComponent = undefined as any;

    expect(() => {
      component.onRegisterSubmit(formData);
      tick();
    }).not.toThrow();
  }));

  // ============================================
  // TEMPLATE INTEGRATION TESTS
  // ============================================

  it('should render dynamic form component', () => {
    const dynamicFormElement =
      fixture.nativeElement.querySelector('lib-dynamic-form');
    expect(dynamicFormElement).toBeTruthy();
  });

  it('should have correct template structure', () => {
    const container = fixture.nativeElement.querySelector(
      '.dynamic-form-container',
    );
    expect(container).toBeTruthy();
  });

  it('should display logo image', () => {
    const logoImg = fixture.nativeElement.querySelector('img[alt="logo"]');
    expect(logoImg).toBeTruthy();
    expect(logoImg.src).toContain('image.png');
  });

  it('should display alternative logo in right column', () => {
    const allImages = fixture.nativeElement.querySelectorAll('img');
    let found = false;
    allImages.forEach((img: HTMLImageElement) => {
      if (img.src.includes('logo11.png')) {
        found = true;
      }
    });
    expect(found).toBe(true);
  });

  it('should display form title', () => {
    const titleElement = fixture.nativeElement.querySelector('.baroque-title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Registration');
  });

  // ============================================
  // BINDING TESTS
  // ============================================

  it('should bind formConfig to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );
    expect(dynamicFormDebug).toBeTruthy();
    expect(dynamicFormDebug.componentInstance.formConfig).toBe(
      component.formConf,
    );
  });

  it('should bind formTitle to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );
    expect(dynamicFormDebug.componentInstance.formTitle).toBe(
      component.formTitle,
    );
  });

  it('should bind layout to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );
    expect(dynamicFormDebug.componentInstance.layout).toBe(component.layout);
  });

  it('should bind enableSocialLogin to dynamic form component', () => {
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );
    expect(dynamicFormDebug.componentInstance.enableSocialLogin).toBe(
      component.enableSocialLogin,
    );
  });

  // ============================================
  // EVENT EMITTER TESTS
  // ============================================

  it('should handle formSubmit event from dynamic form', () => {
    spyOn(component, 'onRegisterSubmit');
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );
    const testData = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
    };

    dynamicFormDebug.componentInstance.formSubmit.emit(testData);

    expect(component.onRegisterSubmit).toHaveBeenCalledWith(testData);
  });

  it('should handle formStatusChange event from dynamic form', () => {
    spyOn(component, 'onFormStatusChange');
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );
    const testStatus = { valid: true, errors: {} };

    dynamicFormDebug.componentInstance.formStatusChange.emit(testStatus);

    expect(component.onFormStatusChange).toHaveBeenCalledWith(testStatus);
  });

  it('should handle fieldValueChange event from dynamic form', () => {
    spyOn(component, 'onFieldValueChange');
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );

    // Mock FormGroup
    const mockFormGroup = {
      get: jasmine.createSpy('get'),
      value: { email: 'test@example.com' },
    } as any;

    const testEvent = {
      fieldName: 'email',
      value: 'test@example.com',
      form: mockFormGroup,
    };

    dynamicFormDebug.componentInstance.fieldValueChange.emit(testEvent);

    expect(component.onFieldValueChange).toHaveBeenCalledWith(testEvent);
  });

  it('should handle login event from dynamic form', () => {
    spyOn(component, 'login');
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );

    dynamicFormDebug.componentInstance.login.emit();

    expect(component.login).toHaveBeenCalled();
  });

  it('should handle googleSignin event from dynamic form', () => {
    spyOn(component, 'onGoogleSignIn');
    const dynamicFormDebug = fixture.debugElement.query(
      By.css('lib-dynamic-form'),
    );

    dynamicFormDebug.componentInstance.googleSignin.emit();

    expect(component.onGoogleSignIn).toHaveBeenCalled();
  });
});
