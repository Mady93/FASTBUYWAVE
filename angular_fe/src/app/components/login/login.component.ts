import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DynamicFormComponent,
  FieldChangeEvent,
  FormConfig,
} from 'my-lib-inside';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faArrowRotateRight,
  faRightToBracket,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { finalize } from 'rxjs';

/**
 * @category Components
 * 
 * @description
 * Manages the login page for users. This component:
 * - Displays a dynamic login form with email and password fields.
 * - Supports form validation including required, pattern, and min length checks.
 * - Allows social login if enabled.
 * - Handles login submission via AuthGoogleService.
 * - Navigates users to the dashboard on successful login or to registration page.
 * - Uses OnPush change detection and standalone Angular component design.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    DynamicFormComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  /**
   * @property dynamicFormComponent
   * @description Reference to the DynamicFormComponent used inside this component.
   * @type {DynamicFormComponent}
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
   * @description Service for authentication via Google.
   */
  private authGoogleService = inject(AuthGoogleService);

  /**
   * @property library
   * @description FontAwesome icon library service injected to add icons dynamically.
   */
  private library = inject(FaIconLibrary);

  // Configurazione UI

  /**
   * @property logo_
   * @description Alternative logo used in some layouts or fallback scenarios.
   * @type {string}
   */
  logo_: string = '/logo11.png';

  /**
   * @property logo
   * @description Main logo displayed on the login form.
   * @type {string}
   */
  logo: string = '/image.png';

  /**
   * @property formTitle
   * @description Title displayed above the login form.
   * @type {string}
   */
  formTitle: string = 'Sign In';

  /**
   * @property formClass
   * @description CSS class applied to the form container.
   * @type {string}
   */
  formClass: string = 'my-form';

  /**
   * @property cardClass
   * @description CSS class applied to the card wrapping the form.
   * @type {string}
   */
  cardClass: string = 'my-card';

  /**
   * @property backdrop
   * @description Enables a backdrop behind the login form.
   * @type {boolean}
   */
  backdrop: boolean = true;

  /**
   * @property backdropBlur
   * @description Applies blur effect to the backdrop if true.
   * @type {boolean}
   */
  backdropBlur: boolean = true;

  /**
   * @property layout
   * @description Determines the form layout. Possible values:
   * - 'card': form inside a card
   * - 'inline': inline form layout
   * - 'horizontal': horizontal layout
   * @type {'card' | 'inline' | 'horizontal'}
   */
  layout: 'card' | 'inline' | 'horizontal' = 'card';

  /**
   * @property enableSocialLogin
   * @description Enables display of social login buttons (e.g., Google, Facebook).
   * @type {boolean}
   */
  enableSocialLogin: boolean = true;

  /**
   * @property formStatus
   * @description Tracks the form's validation status and errors.
   */
  formStatus = { valid: false, errors: {} };

  /**
   * @constructor
   * @description Initializes the LoginComponent and injects necessary services.
   */
  constructor() {}

  /**
   * @property formConf
   * @description Configuration object for the dynamic login form.
   * Includes fields, validators, and buttons with icons.
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
    ],
    buttons: [
      {
        id: 'submit',
        label: 'Sign in',
        type: 'submit',
        class:
          'btn-block mb-3 py-1 px-4 d-flex align-items-center justify-content-center',
        icon: faRightToBracket as any,
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
        id: 'register',
        label: 'Go to Sign Up',
        type: 'button',
        class:
          'btn-block mb-3 py-1 px-4 d-flex align-items-center justify-content-center',
        icon: faUserPlus as any,
      },
    ],
    formValidators: [],
  };

  /**
   * @inheritdoc
   * @method ngOnInit
   * @description Adds necessary FontAwesome icons to the library on initialization.
   */
  ngOnInit(): void {
    this.library.addIcons(faRightToBracket);
    this.library.addIcons(faArrowRotateRight);
  }

  /**
   * @method onRegister
   * @description Navigate the user to the registration page.
   */
  onRegister() {
    this.router.navigate(['/register']);
  }

  /**
   * @method onFieldValueChange
   * @description Callback for changes in dynamic form fields.
   * @param {FieldChangeEvent} event - Event containing field name and new value.
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
   * @method onLoginSubmit
   * @description Submits the login form if valid and performs authentication via AuthGoogleService.
   * Navigates to dashboard on success and resets the dynamic form.
   * @param {any} formData - Data object from the form fields.
   */
  onLoginSubmit(formData: any) {
    if (!this.formStatus.valid) return;

    console.dir('form of parent: ', formData);

    this.authGoogleService
      .login(formData)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (response) => {
          this.authGoogleService.pub_init();
          this.router.navigate(['/dashboard']);
          this.dynamicFormComponent.resetForm();
        },
        error: (err) => {
          console.error('Login failed', err);
        },
      });
  }
}
