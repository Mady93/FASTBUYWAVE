import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AdvertisementItem,
  CarouselComponent,
  ModalAction,
  ModalComponent,
} from 'my-lib-inside';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageDTO } from 'src/app/interfaces/dtos/image_dto.interface';
import { detectMimeType } from 'src/app/utils/file-utils';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import { MatDialog } from '@angular/material/dialog';
import { SendMessageDialogComponent } from '../send-message-dialog/send-message-dialog.component';
import { CommentService } from 'src/app/services/path/comment/comment.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgZone } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommentTreeDTO } from 'src/app/interfaces/dtos/comment/comment_dto';
import { MatCardModule } from '@angular/material/card';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  findCommentById,
  findParent,
  isMaxDepthReached,
} from 'src/app/utils/comment-utils';
import { findScrollParent } from 'src/app/utils/ui-utils';
import { getEmojiName, smileys } from 'src/app/utils/emoji-utils';
import Swal from 'sweetalert2';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';

/**
 * @category Dialogs
 * 
 * @description
 * Dialog component that displays advertisement details and manages
 * the nested comment system with real-time updates.
 *
 * Provides full interface for:
 * - Viewing advertisement details
 * - Creating/editing/deleting comments
 * - Replying to comments (up to 10 levels)
 * - Emoji picker support
 * - Profile image loading
 * - Scroll to comment with highlight
 * - Responsive design
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-ad-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    CarouselComponent,
    ModalComponent,
  ],
  templateUrl: './ad-detail-dialog.component.html',
  styleUrl: './ad-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdDetailDialogComponent implements OnInit, OnDestroy {
  // ────────────────────────────────────────────────────────────────────────
  // DEPENDENCY INJECTION
  // ────────────────────────────────────────────────────────────────────────

  /** @description Angular Material Dialog service for opening dialogs */
  private dialog = inject(MatDialog);

  /** @description Angular FormBuilder for reactive forms */
  private fb = inject(FormBuilder);

  /** @description Service handling comment CRUD operations and WebSocket */
  private commentService = inject(CommentService);

  /** @description Angular ChangeDetectorRef to manually trigger change detection */
  private cdRef = inject(ChangeDetectorRef);

  /** @description Angular Material SnackBar service to show toast messages */
  private snackBar = inject(MatSnackBar);

  /** @description Service to fetch user profile images */
  private profileService = inject(ProfileService);

  /** @description Angular NgZone to run code inside/outside Angular's zone for performance */
  private ngZone = inject(NgZone);

  /** @description Platform service to detect browser or server environment */
  private platform = inject(Platform);

  /** @description Service for Google authentication and user info */
  private authGoogleService = inject(AuthGoogleService);

  /** @description API configuration service providing endpoints */
  private apiConfig = inject(ApiConfigService);

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT DATA
  // ────────────────────────────────────────────────────────────────────────

  /** @description Array of product images extracted from the product DTO */
  images: ImageDTO[] = [];

  /** @description Controls the visibility of the full-screen image zoom modal */
  showZoomModal = false;

  // ────────────────────────────────────────────────────────────────────────
  // COMMENTS DATA STRUCTURES
  // ────────────────────────────────────────────────────────────────────────

  /** @description Flattened tree of comments with nested children structure */
  comments: CommentTreeDTO[] = [];

  /** @description Reactive form for creating new root-level comments */
  newCommentForm!: FormGroup;

  //** @description Set of comment IDs whose reply threads are currently expanded */
  expandedCommentIds: Set<number> = new Set();

  /** @description Currently selected comment for the context menu (if any) */
  selectedCommentForMenu: CommentTreeDTO | null = null;

  /** @description Map of user profile images (base64) keyed by user ID */
  userImages: { [userId: number]: string } = {};

  /** @description Default fallback image path for users without a profile image */
  imgDefault = '/logo11.png';

  /** @description Current authenticated user's profile image (base64) */
  currentUserProfileImage: string = '';

  /** @description Current authenticated user's ID */
  currentUserId = 0;

  /** @description Comment statistics: total count and root comments count */
  commentStats: { total: number; rootComments: number } = {
    total: 0,
    rootComments: 0,
  };

  /** @description Expose Math object to template for rounding, ceil, floor, etc. */
  Math: any;

  // ────────────────────────────────────────────────────────────────────────
  // INTERACTION STATES
  // ────────────────────────────────────────────────────────────────────────

  /** @description ID of the comment being replied to; null if no reply is active */
  isReplyingTo: number | null = null;

  /** @description ID of the comment being edited; null if no edit is active */
  isEditing: number | null = null;

  /** @description Map of reply form contents keyed by parent comment ID */
  replyContents: { [commentId: number]: string | undefined } = {};

  /** @description Map tracking whether a reply textarea has been touched (for validation) */
  replyTouched: { [commentId: number]: boolean } = {};

  /** @description Current content of the comment being edited */
  editContent: string = '';

  // ────────────────────────────────────────────────────────────────────────
  // EMOJI PICKER STATES
  // ────────────────────────────────────────────────────────────────────────

  /** @description Predefined list of emojis available in the picker */
  smileys = smileys;

  /** @description Function to get a human-readable name for an emoji */
  getEmojiName = getEmojiName;

  /** @description Whether the main comment textarea is focused */
  isTextareaFocused = false;

  /** @description Whether the main emoji picker is visible */
  showEmojiPicker = false;

  /** @description Whether the edit mode textarea is focused */
  isEditTextareaFocused = false;

  /** @description Whether the reply mode textarea is focused */
  isReplyTextareaFocused = false;

  /** @description Whether the edit mode emoji picker is visible */
  showEditEmojiPicker = false;

  /** @description Whether the reply mode emoji picker is visible */
  showReplyEmojiPicker = false;

  // ────────────────────────────────────────────────────────────────────────
  // LOADING STATES (SIGNALS)
  // ────────────────────────────────────────────────────────────────────────

  /** @description true while submitting a new root comment */
  isSubmitting = signal(false);

  /** @description true while submitting a reply */
  isSubmittingReply = signal(false);

  /** @description true while saving an edited comment */
  isSubmittingEdit = signal(false);

  /** @description true while deleting a comment */
  isDeletingComment: WritableSignal<boolean> = signal(false);

  /** @description true while loading more comments (pagination) */
  isLoadingMore = signal(false);

  /** @description Observable for global loading state from the comment service */
  public loading$ = this.commentService.loading$;

  /** @description true during discard animation for reply forms */
  isDiscarding = signal(false);

  /** @description true during discard animation for new comment form */
  isDiscardingcomment = signal(false);

  // ────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────

  /** @description RxJS subscription bag for cleanup on destroy */
  private subscription = new Subscription();

  // ────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ────────────────────────────────────────────────────────────────────────

  /** @description Utility function to detect MIME type from base64 string. */
  detectMimeType = detectMimeType;

  // ────────────────────────────────────────────────────────────────────────
  // CONSTRUCTOR
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Initializes the component and extracts product images
   * @param dialogRef - Reference to the Material dialog
   * @param data - Advertisement data and product array
   */
  constructor(
    public dialogRef: MatDialogRef<AdDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ad: AdvertisementItem;
      product: ProductDTO[];
      isUserAd: () => boolean;
    },
  ) {
    // Extract images from the first product if available
    if (data.product.length > 0) {
      this.images = data.product[0].images!;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // LIFECYCLE HOOKS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Initializes the component in browser environment,
   * sets up comment form, WebSocket, user data and event listeners.
   */
  ngOnInit(): void {
    if (this.platform.isBrowser) {
      this.initNewCommentForm();
      this.refreshComments();
      this.getCurrentUserId();

      // Global click/touch outside handler for emoji picker
      document.addEventListener(
        'click',
        this.onClickOutsideEmojiPicker.bind(this),
      );
      document.addEventListener(
        'touchstart',
        this.onClickOutsideEmojiPicker.bind(this),
      );

      // Handle hardware back button on Android/iOS
      document.addEventListener('backbutton', this.handleBackButton.bind(this));
    }
  }

  /**
   * @inheritdoc
   * @description Cleans up resources when component is destroyed
   * (unsubscribe observables, disconnect WebSocket, remove event listeners)
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.commentService.disconnectWebSocket();
    this.commentService.clearComments();

    // Remove all event listeners
    document.removeEventListener(
      'click',
      this.onClickOutsideEmojiPicker.bind(this),
    );
    document.removeEventListener(
      'touchstart',
      this.onClickOutsideEmojiPicker.bind(this),
    );
    document.removeEventListener(
      'backbutton',
      this.handleBackButton.bind(this),
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // DIALOG CLOSE HANDLING
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Closes the dialog after checking for unsaved changes.
   *
   * Checks three possible sources of unsaved content:
   * - New comment form with content
   * - Edit mode with content
   * - Reply form with content
   *
   * If unsaved changes exist, shows a SweetAlert2 confirmation dialog.
   *
   * @returns Promise that resolves when close operation completes
   */
  async onClose(): Promise<void> {
    const hasUnsavedComment =
      this.newCommentForm.dirty && this.contentCtrl?.value?.trim();
    const hasUnsavedEdit = this.isEditing !== null && this.editContent?.trim();
    const hasUnsavedReply =
      this.isReplyingTo !== null &&
      this.replyContents[this.isReplyingTo]?.trim();

    if (hasUnsavedComment || hasUnsavedEdit || hasUnsavedReply) {
      const result = await Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, close it!',
        cancelButtonText: 'Cancel',
        background: '#fff',
      });
      if (!result.isConfirmed) return;
    }

    this.dialogRef.close();
  }

  /**
   * @description Handles keyboard events, specifically the Escape key.
   * If there are unsaved changes, prevents default and shows confirmation.
   * Otherwise, closes the dialog immediately.
   *
   * @param event - Keyboard event
   */
  async onKeyDown(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Escape') {
      const hasUnsavedComment =
        this.newCommentForm.dirty && this.contentCtrl?.value?.trim();
      const hasUnsavedEdit =
        this.isEditing !== null && this.editContent?.trim();
      const hasUnsavedReply =
        this.isReplyingTo !== null &&
        this.replyContents[this.isReplyingTo]?.trim();

      if (hasUnsavedComment || hasUnsavedEdit || hasUnsavedReply) {
        event.preventDefault();
        await this.onClose();
      } else {
        this.dialogRef.close();
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // CONTACT MODAL
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Opens the contact modal to send a message to the advertisement owner.
   * Passes the advertisement data, product information, and current user ID.
   */
  openContactModal(): void {
    console.log('Product ID: ' + this.data.ad.productId);
    this.dialog.open(SendMessageDialogComponent, {
      data: {
        ad: this.data.ad,
        product: this.data.product,
        currentUserId: this.currentUserId,
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // FORM INITIALIZATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Initializes the new comment form with validators.
   * Content is required and limited to 244 characters.
   */
  private initNewCommentForm(): void {
    this.newCommentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(244)]],
    });
  }

  /**
   * @description Getter for the content control of the new comment form.
   * Provides easy access in the template.
   */
  get contentCtrl() {
    return this.newCommentForm.get('content');
  }

  // ────────────────────────────────────────────────────────────────────────
  // COMMENTS LOADING & WEBSOCKET
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Initializes the WebSocket connection for real-time comments
   * and loads existing comments for the advertisement.
   *
   * The WebSocket is only initialized if not already connected.
   * Subscribes to the comments observable and updates:
   * - Comments tree
   * - Comment statistics
   * - Profile images for all users
   */
  refreshComments(): void {
    // Initialize WebSocket only if not already connected
    if (!this.commentService['isConnected']) {
      this.commentService.initializeWebSocket(this.data.ad.advertisementId!);
    }

    this.commentService.refreshComments(this.data.ad.advertisementId!);

    this.subscription.add(
      this.commentService.comments$.subscribe((comments) => {
        this.ngZone.run(() => {
          this.comments = [...comments];
          this.commentStats = this.commentService.getCommentStats();
          this.loadAllProfileImages(comments);
          this.cdRef.markForCheck();
        });
      }),
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // COMMENT OPERATIONS (CRUD)
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Submits a new root-level comment
   * Validates form, sets loading state, and calls the comment service
   */
  submitNewComment(): void {
    if (this.newCommentForm.invalid) return;

    this.isSubmitting.set(true);
    const content = this.newCommentForm.value.content;

    this.subscription.add(
      this.commentService
        .createRootComment(
          this.data.ad.advertisementId!,
          content,
          this.currentUserId,
        )
        .subscribe({
          next: () => {
            this.newCommentForm.reset({ content: '' }, { emitEvent: false });

            const control = this.newCommentForm.get('content');
            if (control) {
              control.setErrors(null);
              control.markAsPristine();
              control.markAsUntouched();
              control.updateValueAndValidity();
            }

            this.isSubmitting.set(false);
            showSnackBar(this.snackBar, 'Comment sent successfully');
            this.cdRef.markForCheck();
          },
          error: () => {
            showSnackBar(this.snackBar, 'Error creating comment');
            this.isSubmitting.set(false);
          },
        }),
    );
  }

  /**
   * @description Toggles reply form for a comment
   * Checks maximum nesting level (10)
   * @param commentId - ID of the comment to reply to
   */
  toggleReply(commentId: number): void {
    // Check if maximum depth is reached
    if (isMaxDepthReached(this.comments, commentId)) {
      showSnackBar(
        this.snackBar,
        'Maximum nesting level reached (11). Cannot reply further',
      );
      return;
    }

    if (this.isReplyingTo === commentId) {
      this.isReplyingTo = null;
    } else {
      this.isReplyingTo = commentId;
      if (!(commentId in this.replyContents)) {
        this.replyContents[commentId] = ''; // Initialize empty string if missing
      }
    }
  }

  /**
   * @description Submits a reply to a comment
   * @param commentId - ID of the parent comment
   */
  submitReply(commentId: number): void {
    const content = this.replyContents[commentId];

    if (!content?.trim()) {
      this.replyTouched[commentId] = true;
      this.cdRef.markForCheck();
      return;
    }

    this.isSubmittingReply.set(true);

    this.commentService
      .createReply(commentId, content, this.currentUserId)
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.replyContents[commentId] = '';
            this.replyTouched[commentId] = false;
            this.isReplyingTo = null;
            this.isSubmittingReply.set(false);
            showSnackBar(this.snackBar, 'Response sent successfully');
            this.cdRef.markForCheck();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.isSubmittingReply.set(false);
            showSnackBar(this.snackBar, 'Error sending response');
          });
        },
      });
  }

  /**
   * @description Formats an ISO date string to human-readable format
   * @param dateStr - ISO date string
   * @returns Formatted date string
   */
  public formatDate(dateStr: string): string {
    return this.commentService.formatDate(dateStr);
  }

  /**
   * @description TrackBy function for ngFor optimization
   * @param index - Current index
   * @param comment - Comment object
   * @returns Unique identifier (comment ID)
   */
  trackByCommentId(index: number, comment: CommentTreeDTO): number {
    return comment.id ?? index;
  }

  // ────────────────────────────────────────────────────────────────────────
  // EDIT OPERATIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Checks if the current user can edit a comment
   * @param comment - Comment to check
   * @returns true if user can edit
   */
  canEditComment(comment: CommentTreeDTO): boolean {
    return comment.user.userId === this.currentUserId;
  }

  /**
   * @description Starts the edit mode for a comment.
   * Finds the comment in the tree and copies its content to editContent.
   *
   * @param commentId - ID of the comment to edit
   */
  startEdit(commentId: number): void {
    this.isEditing = commentId;
    const comment = findCommentById(commentId, this.comments);
    if (comment) {
      this.editContent = comment.content;
    }
  }

  /**
   * @description Cancels the edit mode and clears edit content.
   */
  cancelEdit(): void {
    this.isEditing = null;
    this.editContent = '';
  }

  /**
   * @description Saves the edited comment content.
   * Validates content, sets loading state, and calls the comment service.
   *
   * @param commentId - ID of the comment being edited
   */
  saveEdit(commentId: number): void {
    if (!this.editContent.trim()) return;

    this.isSubmittingEdit.set(true);

    this.commentService
      .updateComment(commentId, this.editContent, this.currentUserId)
      .subscribe({
        next: () => {
          this.isEditing = null;
          this.editContent = '';
          this.isSubmittingEdit.set(false);
          showSnackBar(this.snackBar, 'Comment updated successfully');
          this.cdRef.markForCheck();
        },
        error: () => {
          this.isSubmittingEdit.set(false);
          showSnackBar(this.snackBar, 'Error saving comment');
        },
      });
  }

  // ────────────────────────────────────────────────────────────────────────
  // DELETE OPERATIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Checks if the current user can delete a comment.
   * Only the comment author can delete.
   *
   * @param comment - Comment to check
   * @returns `true` if user can delete
   */
  canDeleteComment(comment: CommentTreeDTO): boolean {
    return comment.user.userId === this.currentUserId;
  }

  /**
   * @description Shows a confirmation dialog before deleting a comment.
   * Distinguishes between root comments and replies for appropriate messaging.
   *
   * @param comment - Comment to delete
   */
  confirmDeleteComment(comment: CommentTreeDTO): void {
    const isReply = comment.depthLevel > 0;
    const title = isReply ? 'Delete reply?' : 'Delete comment?';
    const successMessage = isReply
      ? 'Reply deleted successfully'
      : 'Comment deleted successfully';
    const errorMessage = isReply
      ? 'Error deleting reply'
      : 'Error deleting comment';

    Swal.fire({
      title: title,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteComment(comment.id!, successMessage, errorMessage);
      }
    });
  }

  /**
   * @description Executes the comment deletion.
   * Sets loading state and calls the comment service.
   *
   * @param commentId - ID of the comment to delete
   * @param successMessage - Message to show on success
   * @param errorMessage - Message to show on error
   */
  private deleteComment(
    commentId: number,
    successMessage: string,
    errorMessage: string,
  ): void {
    this.isDeletingComment.set(true);
    this.commentService.deleteComment(commentId, this.currentUserId).subscribe({
      next: () => {
        this.isDeletingComment.set(false);
        showSnackBar(this.snackBar, successMessage);
      },
      error: (err) => {
        console.error('Error during deletion:', err);
        this.isDeletingComment.set(false);
        showSnackBar(this.snackBar, errorMessage);
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // CANCEL/DISCARD OPERATIONS WITH ANIMATIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Waits for the next animation frame.
   * Utility for coordinating animations.
   *
   * @returns Promise that resolves on the next animation frame
   */
  async waitForNextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  /**
   * @description Cancels a reply with animation.
   * Two behaviors:
   * - If reply has content: clears the content only
   * - If reply is empty: closes the reply form
   *
   * Uses runOutsideAngular to prevent change detection during animation,
   * then re-enters Angular to update state.
   *
   * @param commentId - ID of the parent comment
   */
  cancelReply(commentId: number): void {
    if (this.isDiscarding()) {
      return;
    }

    this.isDiscarding.set(true);

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          const hasContent = this.replyContents[commentId]?.trim();

          if (hasContent) {
            // Case 1: Form has content → clear only
            this.replyContents[commentId] = '';
            this.replyTouched[commentId] = false;
            this.isDiscarding.set(false);
          } else {
            // Case 2: Form is empty → close the form
            this.isReplyingTo = null;
            this.replyContents[commentId] = '';
            this.replyTouched[commentId] = false;
            this.isDiscarding.set(false);
          }

          this.cdRef.markForCheck();
        });
      }, 300);
    });
  }

  /**
   * @description Cancels a new comment with animation.
   * Resets the form after a delay to allow animation to complete.
   */
  cancelComment(): void {
    if (this.isDiscardingcomment()) {
      return;
    }

    this.isDiscardingcomment.set(true);

    setTimeout(() => {
      this.newCommentForm.reset();
      const ctrl = this.contentCtrl;
      if (ctrl) {
        ctrl.updateValueAndValidity();
      }
      this.isDiscardingcomment.set(false);
    }, 1000);
  }

  // ────────────────────────────────────────────────────────────────────────
  // PROFILE IMAGES
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Loads profile images for all users in the comment tree.
   * Processes comments recursively and converts images to base64 format.
   *
   * @param comments - Array of comments to process
   */
  loadAllProfileImages(comments: CommentTreeDTO[]): void {
    const processComment = (comment: CommentTreeDTO) => {
      const imageUrl = comment.user.profileImageUrl;
      const userId = comment.user.userId;

      if (imageUrl) {
        const fullUrl = `${this.apiConfig.apiProfile}${imageUrl}`;
        this.profileService.getImageByUrl(fullUrl).subscribe({
          next: (profileImage: Blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              const base64 = dataUrl.split(',')[1]; // Extract pure base64
              const mimeType = detectMimeType(base64.slice(0, 10));
              this.userImages[userId] = `data:${mimeType};base64,${base64}`;
              this.cdRef.markForCheck();
            };
            reader.readAsDataURL(profileImage);
          },
          error: () => {
            this.userImages[userId] = this.imgDefault;
            this.cdRef.markForCheck();
          },
        });
      }

      // Recursively process children
      if (comment.children && comment.children.length > 0) {
        comment.children.forEach(processComment);
      }
    };

    comments.forEach(processComment);
  }

  /**
   * @description Retrieves the current user ID from the authentication service.
   * After obtaining the ID, loads the user's profile image.
   */
  private getCurrentUserId(): void {
    this.authGoogleService.userInfo$.subscribe({
      next: (userInfo) => {
        if (userInfo && userInfo.userId) {
          this.currentUserId = +userInfo.userId;
          console.log('[getCurrentUserId] UserId found:', this.currentUserId);
          this.loadCurrentUserProfileImage();
        } else {
          console.log('[getCurrentUserId] No userInfo found');
          this.currentUserProfileImage = '';
        }
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('[getCurrentUserId] Error:', error);
        this.currentUserProfileImage = '';
        this.cdRef.markForCheck();
      },
    });
  }

  /**
   * @description Loads the current user's profile image as base64.
   */
  private loadCurrentUserProfileImage(): void {
    if (!this.currentUserId) return;

    this.profileService
      .getCurrentUserProfileImageBase64(this.currentUserId)
      .subscribe({
        next: (dataUrl: string) => {
          this.currentUserProfileImage = dataUrl;
          this.cdRef.markForCheck();
        },
        error: () => {
          this.currentUserProfileImage = '';
          this.cdRef.markForCheck();
        },
      });
  }

  // ────────────────────────────────────────────────────────────────────────
  // THREAD EXPANSION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Toggles the expanded state of a comment's replies.
   *
   * @param commentId - ID of the comment
   */
  toggleReplies(commentId: number): void {
    if (this.expandedCommentIds.has(commentId)) {
      this.expandedCommentIds.delete(commentId);
    } else {
      this.expandedCommentIds.add(commentId);
    }
  }

  /**
   * @description Checks if a comment's replies are expanded.
   *
   * @param commentId - ID of the comment
   * @returns `true` if replies are expanded
   */
  hasRepliesExpanded(commentId: number): boolean {
    return this.expandedCommentIds.has(commentId);
  }

  // ────────────────────────────────────────────────────────────────────────
  // SCROLL TO COMMENT
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Scrolls to a specific comment and highlights it.
   * Finds the nearest scrollable parent and centers the comment in the view.
   * Adds a temporary highlight class that fades out.
   *
   * @param commentId - ID of the comment to scroll to
   */
  scrollToComment(commentId: number): void {
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (!commentElement) return;

    const card = commentElement.querySelector('.comment-card') as HTMLElement;
    const scrollParent = findScrollParent(commentElement);

    if (card && scrollParent) {
      const cardRect = card.getBoundingClientRect();
      const parentRect = scrollParent.getBoundingClientRect();
      const offset = cardRect.top - parentRect.top + scrollParent.scrollTop;

      scrollParent.scrollTo({
        top: offset - parentRect.height / 2 + cardRect.height / 2,
        behavior: 'smooth',
      });

      // Highlight animation
      document
        .querySelectorAll('.comment-card.highlight')
        .forEach((el) => el.classList.remove('highlight'));
      card.classList.add('highlight');

      const onAnimationEnd = () => {
        card.classList.remove('highlight');
        card.removeEventListener('animationend', onAnimationEnd);
      };
      card.addEventListener('animationend', onAnimationEnd);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // PARENT NAVIGATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Finds the parent of a comment in the tree.
   *
   * @param comment - Comment to find parent for
   * @returns Parent comment or null if root
   */
  getParentOf(comment: CommentTreeDTO): CommentTreeDTO | null {
    return findParent(comment.id!, this.comments);
  }

  // ────────────────────────────────────────────────────────────────────────
  // EMOJI PICKER
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Toggles the main emoji picker visibility.
   * Stops event propagation to prevent immediate closure.
   * Closes other pickers when opening this one.
   *
   * @param event - Optional click event
   */
  toggleEmojiPicker(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.showEmojiPicker = !this.showEmojiPicker;

    // Close other pickers when opening this one
    if (this.showEmojiPicker) {
      this.showEditEmojiPicker = false;
      this.showReplyEmojiPicker = false;
    }
  }

  /**
   * @description Adds an emoji to the new comment content.
   *
   * @param emoji - Emoji character to add
   */
  addSimpleEmoji(emoji: string): void {
    const currentContent = this.contentCtrl?.value || '';
    this.contentCtrl?.setValue(currentContent + emoji);
    this.showEmojiPicker = false;
  }

  /**
   * @description Handles clicks outside emoji pickers to close them.
   * Checks if the click target is within any picker or its trigger button.
   *
   * @param event - Click or touch event
   */
  onClickOutsideEmojiPicker(event: Event): void {
    const target = event.target as HTMLElement;

    // Check if click is on main emoji button (not in edit/reply mode)
    const isClickOnMainEmojiBtn =
      target.closest('.custom-comment-form .emoji-btn') &&
      !this.isEditing &&
      !this.isReplyingTo;

    // Check if click is inside main emoji picker
    const isClickOnMainEmojiPicker =
      target.closest('.emoji-picker-wrapper') && this.showEmojiPicker;

    // Close main picker if click is outside
    if (!isClickOnMainEmojiBtn && !isClickOnMainEmojiPicker) {
      this.showEmojiPicker = false;
    }

    // Handle edit mode picker
    const isClickOnEditEmoji =
      target.closest('.custom-comment-form .emoji-btn') &&
      this.isEditing !== null;
    if (!isClickOnEditEmoji) {
      this.showEditEmojiPicker = false;
    }

    // Handle reply mode picker
    const isClickOnReplyEmoji =
      target.closest('.custom-comment-form .emoji-btn') &&
      this.isReplyingTo !== null;
    if (!isClickOnReplyEmoji) {
      this.showReplyEmojiPicker = false;
    }
  }

  /**
   * @description Handles backdrop clicks by delegating to the outside click handler.
   * Useful for mobile touch handling.
   *
   * @param event - Click event
   */
  handleBackdropClick(event: Event): void {
    this.onClickOutsideEmojiPicker(event);
  }

  /**
   * @description Handles the hardware back button on mobile devices.
   * Closes any open emoji picker.
   */
  handleBackButton(): void {
    if (this.showEmojiPicker) {
      this.showEmojiPicker = false;
      this.cdRef.detectChanges();
    }
  }

  /**
   * @description Toggles the edit mode emoji picker.
   * Closes the reply picker when opening this one.
   */
  toggleEditEmojiPicker(): void {
    this.showEditEmojiPicker = !this.showEditEmojiPicker;
    this.showReplyEmojiPicker = false; // Close the other picker
  }

  /**
   * @description Toggles the reply mode emoji picker.
   * Closes the edit picker when opening this one.
   */
  toggleReplyEmojiPicker(): void {
    this.showReplyEmojiPicker = !this.showReplyEmojiPicker;
    this.showEditEmojiPicker = false; // Close the other picker
  }

  /**
   * @description Adds an emoji to the edit content.
   *
   * @param emoji - Emoji character to add
   */
  addEditEmoji(emoji: string): void {
    this.editContent = (this.editContent || '') + emoji;
    this.showEditEmojiPicker = false;
  }

  /**
   * @description Adds an emoji to a reply.
   *
   * @param emoji - Emoji character to add
   * @param commentId - ID of the parent comment
   */
  addReplyEmoji(emoji: string, commentId: number): void {
    if (!this.replyContents[commentId]) {
      this.replyContents[commentId] = '';
    }
    this.replyContents[commentId] += emoji;
    this.showReplyEmojiPicker = false;
  }

  // ────────────────────────────────────────────────────────────────────────
  // FOCUS MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Handles focus on reply textarea.
   * Sets focus flag and marks as touched on first focus.
   *
   * @param commentId - ID of the parent comment
   */
  onReplyFocus(commentId: number): void {
    this.isReplyTextareaFocused = true;
    if (!this.replyTouched[commentId]) {
      this.replyTouched[commentId] = true;
    }
  }

  /**
   * @description Handles blur on reply textarea.
   * Clears focus flag.
   */
  onReplyBlur(): void {
    this.isReplyTextareaFocused = false;
  }

  // ────────────────────────────────────────────────────────────────────────
  // TOOLTIPS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Generates a tooltip for the reply button.
   * For replies to nested comments, shows "Replying to [username]".
   *
   * @param comment - Comment to generate tooltip for
   * @returns Tooltip text
   */
  getReplyTooltip(comment: CommentTreeDTO): string {
    if (comment.depthLevel > 0) {
      const parent = this.getParentOf(comment);
      return parent ? `Replying to ${parent.user.displayName}` : 'Reply';
    }
    return '';
  }

  // ────────────────────────────────────────────────────────────────────────
  // PERMISSION CHECKS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Determines whether to show the action menu for a comment.
   * Rules:
   * 1. At max depth (≥10) and user can't edit/delete → hide
   * 2. User is owner → show edit/delete only
   * 3. User is not owner and below max depth → show reply
   *
   * @param comment - Comment to check
   * @param level - Current depth level
   * @returns `true` if menu should be visible
   */
  shouldShowMenu(comment: CommentTreeDTO, level: number): boolean {
    // At max depth and user can't edit/delete → hide
    if (
      level >= 10 &&
      !this.canEditComment(comment) &&
      !this.canDeleteComment(comment)
    ) {
      return false;
    }

    // User is owner → show edit/delete
    if (comment.user.userId === this.currentUserId) {
      return this.canEditComment(comment) || this.canDeleteComment(comment);
    }

    // User is not owner and below max depth → show reply
    if (level < 10) {
      return true;
    }

    return false;
  }

  /**
   * @description Checks if the current user has already replied to this specific comment.
   * Only checks direct children, not deeper descendants.
   *
   * @param comment - Comment to check
   * @returns `true` if user has a direct reply
   */
  hasUserReplied(comment: CommentTreeDTO): boolean {
    if (!comment.children || comment.children.length === 0) {
      return false;
    }

    // Check only direct children
    const hasDirectReply = comment.children.some(
      (child) =>
        child.user.userId === this.currentUserId && child.active !== false,
    );

    return hasDirectReply;
  }

  /**
   * @description Checks if the user can reply to any comment in the thread.
   * Useful for determining if the reply button should be shown at all.
   *
   * @param comment - Starting comment
   * @returns `true` if there's any comment the user can reply to
   */
  canUserReplyToAnyInChain(comment: CommentTreeDTO): boolean {
    // Check if can reply to this specific comment
    if (
      comment.user.userId !== this.currentUserId &&
      !this.hasUserReplied(comment)
    ) {
      return true;
    }

    // Recursively check children
    if (comment.children && comment.children.length > 0) {
      return comment.children.some((child) =>
        this.canUserReplyToAnyInChain(child),
      );
    }

    return false;
  }

  /**
   * @description Counts active (non-deleted) replies for a comment.
   *
   * @param comment - Comment to count replies for
   * @returns Number of active replies
   */
  countActiveReplies(comment: CommentTreeDTO): number {
    if (!comment.children || comment.children.length === 0) {
      return 0;
    }

    return comment.children.filter((child) => child.active !== false).length;
  }

  // ────────────────────────────────────────────────────────────────────────
  // MODAL ACTIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * @description Gets the actions for the modal footer.
   * Shows a "Contact" button only if:
   * - The current user is not the advertisement owner
   * - The ad is not owned by the current user
   *
   * @returns Array of modal actions
   */
  get modalActions(): ModalAction[] {
    const actions: ModalAction[] = [];

    // Check if contact button should be shown
    if (
      !this.data.isUserAd() &&
      this.currentUserId !== this.data.ad.createdBy?.userId
    ) {
      actions.push({
        id: 'contact',
        label: `Contact ${this.data.ad.agency ? 'Agency' : 'User'}`,
        type: 'primary',
        disabled: false,
        loading: false,
      });
    }

    return actions;
  }

  /**
   * @description Handles modal action clicks.
   * Currently only supports the 'contact' action.
   *
   * @param actionId - ID of the clicked action
   */
  onModalAction(actionId: string): void {
    if (actionId === 'contact') {
      this.openContactModal();
    }
  }

  /**
   * @description Wrapper for the actionClicked event from the modal component.
   * Converts the event to string and delegates to onModalAction.
   *
   * @param event - Event from the modal
   */
  onActionWrapper(event: any): void {
    this.onModalAction(String(event));
  }
}
