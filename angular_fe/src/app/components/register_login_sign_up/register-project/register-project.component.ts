import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FieldChangeEvent, DynamicFormComponent } from 'my-lib-inside';
import { FormConfig } from 'my-lib-inside';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
  faUserPlus,
  faRightToBracket,
  faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { Router } from '@angular/router';

/**
 * @category Components
 *
 * @description
 * Manages the registration page for new users or projects. This component:
 * - Displays a dynamic registration form with email, password, and password confirmation fields.
 * - Includes form validation (required, pattern, min length, and password match).
 * - Provides buttons for standard registration, reset, navigation to login, and Google sign-in.
 * - Supports optional social login via Google.
 * - Updates the form status dynamically and handles form submission.
 * - Uses OnPush change detection and standalone Angular component design.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-register-project',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    DynamicFormComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-project.component.html',
  styleUrls: ['./register-project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterProjectComponent implements OnInit {
  /**
   * @property dynamicFormComponent
   * @description Reference to the dynamic form component used in the template.
   */
  @ViewChild(DynamicFormComponent)
  dynamicFormComponent!: DynamicFormComponent;

  /**
   * @property router
   * @description Angular Router service injected for navigation.
   */
  private router = inject(Router);

  /**
   * @property authGoogleService
   * @description Service used for registration and Google authentication.
   */
  private authGoogleService = inject(AuthGoogleService);

  /**
   * @property library
   * @description FontAwesome icon library service injected to add icons dynamically.
   */
  private library = inject(FaIconLibrary);

  /**
   * @property logo_
   * @description Alternative logo used in some layouts or fallback scenarios
   */
  logo_: string = '/logo11.png';

  /**
   * @property logo
   * @description Main logo displayed on the registration form
   */
  logo: string = '/image.png';

  /**
   * @property formTitle
   * @description Title displayed above the registration form
   */
  formTitle: string = 'Registration';

  /**
   * @property formClass
   * @description CSS class applied to the form container
   */
  formClass: string = 'my-form';

  /**
   * @property cardClass
   * @description CSS class applied to the card wrapping the form
   */
  cardClass: string = 'my-card';

  /**
   * @property backdrop
   * @description Enables a backdrop behind the registration form
   */
  backdrop: boolean = true;

  /**
   * @property backdropBlur
   * @description Applies blur effect to the backdrop if true
   */
  backdropBlur: boolean = true;

  /**
   * @property layout
   * @description Determines the form layout ('card', 'inline', or 'horizontal')
   */
  layout: 'card' | 'inline' | 'horizontal' = 'card';

  /**
   * @property enableSocialLogin
   * @description Enables display of social login buttons
   */
  enableSocialLogin: boolean = true;

  /**
   * @property formStatus
   * @description Tracks the form's validation status and errors
   */
  formStatus = { valid: false, errors: {} };

  /**
   * @constructor
   * @description Initializes the LoginComponent and injects necessary services.
   */
  constructor() {}

  /**
   * @property formConf
   * @description Configuration object for the dynamic registration form.
   * Includes fields, validators, buttons, and custom form validators.
   */
  formConf: FormConfig = {
    fields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        validators: [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
        required: true,
        errorMessages: {
          required: 'Email address is required',
          email: 'Please enter a valid email address',
        },
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(?!.*\\s).{8,16}$',
          ),
        ],
        required: true,
        errorMessages: {
          required: 'Password is required',
          minlength: 'Password must be at least 8 characters long',
          pattern:
            'Password must include at least one number, one lowercase letter, one uppercase letter, and one special character',
        },
      },
      {
        name: 'repeatPassword',
        type: 'password',
        label: 'Repeat the password',
        placeholder: 'Re-enter your password',
        validators: [Validators.required],
        required: true,
        errorMessages: {
          required: 'Password confirmation is required',
          mismatch: 'Passwords do not match',
        },
      },
    ],
    buttons: [
      {
        id: 'submit',
        label: 'Sign up',
        type: 'submit',
        class:
          'btn-block mb-3 py-1 px-4 d-flex align-items-center justify-content-center',
        icon: faUserPlus as any,
      },
      {
        id: 'refresh',
        label: 'Reset',
        type: 'button',
        class:
          'btn-block mb-3 py-1 px-4 d-flex align-items-center justify-content-center',
        icon: faArrowRotateRight as any,
      },
      {
        id: 'login',
        label: 'Go to Sign In with Email',
        type: 'button',
        class:
          'btn-block mb-3 py-1 px-4 d-flex align-items-center justify-content-center',
        icon: faRightToBracket as any,
      },
      {
        id: 'google-signin',
        label: 'Sign in with Google',
        type: 'button',
        class:
          'btn-block mb-3 py-1 px-4 d-flex align-items-center justify-content-center',
        icon: faGoogle as any,
      },
    ],
    formValidators: [this.passwordMatchValidator.bind(this)],
  };

  /**
   * @inheritdoc
   * @method ngOnInit
   * @description Adds necessary FontAwesome icons to the library on initialization */
  ngOnInit(): void {
    this.library.addIcons(faGoogle);
    this.library.addIcons(faUserPlus);
    this.library.addIcons(faRightToBracket);
    this.library.addIcons(faArrowRotateRight);
  }

  /**
   * @method passwordMatchValidator
   * @description Custom validator ensuring that 'password' and 'repeatPassword' match.
   * @param {AbstractControl} control - The form group control.
   */
  passwordMatchValidator(control: AbstractControl) {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const repeatPassword = formGroup.get('repeatPassword')?.value;

    if (password !== repeatPassword) {
      formGroup.get('repeatPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  /**
   * @method onGoogleSignIn
   * @description Triggers Google login via AuthGoogleService
   */
  onGoogleSignIn() {
    console.log('Accedi con Google dal Padre');
    this.authGoogleService.initiateGoogleLogin();
  }

  /**
   * @method login
   * @description Navigates the user to the login page
   */
  login() {
    this.router.navigate(['/login']);
  }

  /**
   * @method onFieldValueChange
   * @description Callback for changes in dynamic form fields.
   * @param {FieldChangeEvent} event - Event containing field name and value.
   */
  onFieldValueChange(event: FieldChangeEvent) {
  }

  /**
   * @method onFormStatusChange
   * @description Updates the local formStatus whenever the dynamic form emits status changes.
   * @param {Object} status - Form status containing 'valid' boolean and 'errors'.
   */
  onFormStatusChange(status: { valid: boolean; errors: any }) {
    this.formStatus = status;
  }

  /**
   * @method onRegisterSubmit
   * @description Submits the registration form if valid. Calls AuthGoogleService.register
   * and navigates to login on success. Resets the dynamic form after submission.
   * @param {any} formData - Data object from the form fields.
   */
  onRegisterSubmit(formData: any) {
    if (!this.formStatus.valid) return;

    let formDataSend = {
      email: formData.email,
      password: formData.password,
    };

    console.dir('form da mandare: ', formDataSend);

    this.authGoogleService.register(formDataSend).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
        this.dynamicFormComponent.resetForm();
      },
      error: (err) => {},
    });
  }
}
