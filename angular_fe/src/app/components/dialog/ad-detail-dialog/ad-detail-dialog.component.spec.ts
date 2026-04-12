// ─────────────────────────────────────────────────────────────────────────────
// SECTION: IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdDetailDialogComponent } from './ad-detail-dialog.component';
import { CommentService } from 'src/app/services/path/comment/comment.service';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { Platform } from '@angular/cdk/platform';
import { UserInfo } from 'src/app/interfaces/jwt/user_info_dto.interface';
import { MatDialog } from '@angular/material/dialog';
import {
  Component,
  NO_ERRORS_SCHEMA,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK COMPONENTS (LIBRARY COMPONENTS)
// ─────────────────────────────────────────────────────────────────────────────

@Component({ selector: 'lib-carousel', template: '', standalone: true })
class MockCarouselComponent {
  @Input() images: any[] = [];
  @Input() autoPlay: boolean = false;
  @Input() interval: number = 3000;
  @Input() showArrows: boolean = true;
  @Input() showDots: boolean = true;
}

@Component({ selector: 'lib-modal', template: '', standalone: true })
class MockModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() closeOnBackdropClick: boolean = true;
  @Output() close = new EventEmitter<void>();
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK COMPONENTS (ANGULAR MATERIAL)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'mat-dialog-content',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatDialogContent {}

@Component({
  selector: 'mat-dialog-actions',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatDialogActions {}

@Component({
  selector: 'mat-form-field',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatFormField {}

@Component({
  selector: 'mat-label',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatLabel {}

@Component({ selector: 'mat-icon', template: '', standalone: true })
class MockMatIcon {}

@Component({
  selector: 'mat-menu',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatMenu {}

@Component({
  selector: 'mat-menu-item',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatMenuItem {}

@Component({ selector: 'mat-spinner', template: '', standalone: true })
class MockMatSpinner {}

@Component({
  selector: 'button[mat-button]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatButton {}

@Component({
  selector: 'button[mat-icon-button]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatIconButton {}

@Component({
  selector: 'button',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockButton {}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK SERVICES
// ─────────────────────────────────────────────────────────────────────────────

class MockCommentService {
  comments$ = new BehaviorSubject<any[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  initializeWebSocket = jasmine.createSpy();
  refreshComments = jasmine.createSpy();
  disconnectWebSocket = jasmine.createSpy();
  clearComments = jasmine.createSpy();
  createRootComment = jasmine.createSpy().and.returnValue(of({}));
  createReply = jasmine.createSpy().and.returnValue(of({}));
  updateComment = jasmine.createSpy().and.returnValue(of({}));
  deleteComment = jasmine.createSpy().and.returnValue(of({}));
  formatDate = (date: string) => date;
  getCommentStats = () => ({ total: 0, rootComments: 0 });
  isConnected = false;
  getCommentsByAdvertisement = jasmine.createSpy().and.returnValue(of([]));
}

class MockProfileService {
  getImageByUrl = jasmine.createSpy().and.returnValue(of(new Blob()));
  getCurrentUserProfileImageBase64 = jasmine
    .createSpy()
    .and.returnValue(of('data:image/jpeg;base64,test'));
  getProfileByUserId = jasmine.createSpy().and.returnValue(of({}));
}

class MockAuthGoogleService {
  userInfo$ = new BehaviorSubject<UserInfo | null>({
    userId: '1',
    email: 'test@test.com',
    roles: ['USER'],
    scopes: [],
  });
  logoutUser = jasmine.createSpy().and.returnValue(of(void 0));
}

class MockApiConfigService {
  apiProfile = 'http://localhost:8080/api/profiles';
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

class MockPlatform {
  isBrowser = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('AdDetailDialogComponent', () => {
  let component: AdDetailDialogComponent;
  let fixture: ComponentFixture<AdDetailDialogComponent>;
  let commentService: MockCommentService;

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MOCK DATA
  // ─────────────────────────────────────────────────────────────────────────

  const mockDialogRef = {
    close: jasmine.createSpy(),
  };

  const mockDialogData = {
    ad: {
      advertisementId: 1,
      title: 'Test Advertisement',
      description: 'Test Description',
      price: 100,
      productId: 1,
      createdBy: { userId: 2, email: 'seller@test.com' },
      imageUrl: '/test.jpg',
      active: true,
    },
    product: [
      {
        productId: 1,
        price: 100,
        active: true,
        condition: 'NEW',
        stockQuantity: 10,
        images: [
          {
            imageId: 1,
            picByte: '/9j/4AAQSkZJRg...',
            active: true,
            product: {} as any,
          },
        ],
      },
    ],
    isUserAd: () => false,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEST SETUP
  // ─────────────────────────────────────────────────────────────────────────

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        MockCarouselComponent,
        MockModalComponent,
        MockMatDialogContent,
        MockMatDialogActions,
        MockMatFormField,
        MockMatLabel,
        MockMatIcon,
        MockMatMenu,
        MockMatMenuItem,
        MockMatSpinner,
        MockMatButton,
        MockMatIconButton,
        MockButton,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: CommentService, useClass: MockCommentService },
        { provide: ProfileService, useClass: MockProfileService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: ApiConfigService, useClass: MockApiConfigService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: Platform, useClass: MockPlatform },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdDetailDialogComponent, {
        set: {
          imports: [
            CommonModule,
            ReactiveFormsModule,
            FormsModule,
            MockCarouselComponent,
            MockModalComponent,
            MockMatDialogContent,
            MockMatDialogActions,
            MockMatFormField,
            MockMatLabel,
            MockMatIcon,
            MockMatMenu,
            MockMatMenuItem,
            MockMatSpinner,
            MockMatButton,
            MockMatIconButton,
            MockButton,
          ],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdDetailDialogComponent);
    component = fixture.componentInstance;
    commentService = TestBed.inject(CommentService) as any;

    fixture.detectChanges();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BASIC TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: INITIALIZATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should extract images from product data', () => {
      expect(component.images.length).toBe(1);
      expect(component.images[0].imageId).toBe(1);
    });

    it('should initialize new comment form', () => {
      expect(component.newCommentForm).toBeTruthy();
      expect(component.contentCtrl).toBeTruthy();
    });

    it('should get current user ID on init', () => {
      expect(component.currentUserId).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: COMMENTS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Comments', () => {
    it('should refresh comments', () => {
      component.refreshComments();
      expect(commentService.initializeWebSocket).toHaveBeenCalledWith(1);
      expect(commentService.refreshComments).toHaveBeenCalledWith(1);
    });

    it('should submit new comment', () => {
      component.newCommentForm.setValue({ content: 'Test comment' });
      component.submitNewComment();
      expect(commentService.createRootComment).toHaveBeenCalledWith(
        1,
        'Test comment',
        1,
      );
    });

    it('should not submit empty comment', () => {
      component.newCommentForm.setValue({ content: '' });
      component.submitNewComment();
      expect(commentService.createRootComment).not.toHaveBeenCalled();
    });

    it('should toggle reply form', () => {
      component.toggleReply(1);
      expect(component.isReplyingTo).toBe(1);
      component.toggleReply(1);
      expect(component.isReplyingTo).toBeNull();
    });

    it('should submit reply', () => {
      component.isReplyingTo = 1;
      component.replyContents[1] = 'Test reply';
      component.submitReply(1);
      expect(commentService.createReply).toHaveBeenCalledWith(
        1,
        'Test reply',
        1,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: EDIT OPERATIONS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Edit operations', () => {
    const mockComment = {
      id: 1,
      content: 'Original content',
      user: { userId: 1 },
      depthLevel: 0,
      directRepliesCount: 0,
      totalRepliesCount: 0,
      createdAt: new Date(),
    } as any;

    beforeEach(() => {
      component.comments = [mockComment];
    });

    it('should check if user can edit comment', () => {
      component.currentUserId = 1;
      expect(component.canEditComment(mockComment)).toBeTrue();

      component.currentUserId = 2;
      expect(component.canEditComment(mockComment)).toBeFalse();
    });

    it('should start edit', () => {
      component.startEdit(1);
      expect(component.isEditing).toBe(1);
      expect(component.editContent).toBe('Original content');
    });

    it('should cancel edit', () => {
      component.isEditing = 1;
      component.cancelEdit();
      expect(component.isEditing).toBeNull();
      expect(component.editContent).toBe('');
    });

    it('should save edit', () => {
      component.isEditing = 1;
      component.editContent = 'Updated content';
      component.saveEdit(1);
      expect(commentService.updateComment).toHaveBeenCalledWith(
        1,
        'Updated content',
        1,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: DELETE OPERATIONS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Delete operations', () => {
    const mockComment = {
      id: 1,
      content: 'Test comment',
      user: { userId: 1 },
      depthLevel: 0,
      directRepliesCount: 0,
      totalRepliesCount: 0,
      createdAt: new Date(),
    } as any;

    it('should check if user can delete comment', () => {
      component.currentUserId = 1;
      expect(component.canDeleteComment(mockComment)).toBeTrue();

      component.currentUserId = 2;
      expect(component.canDeleteComment(mockComment)).toBeFalse();
    });

    it('should confirm delete comment', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }),
      );

      component.confirmDeleteComment(mockComment);
      tick(100);

      expect(swalSpy).toHaveBeenCalled();
      expect(swalSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Delete comment?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
        }),
      );
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: EMOJI PICKER TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Emoji picker', () => {
    it('should toggle emoji picker', () => {
      component.toggleEmojiPicker();
      expect(component.showEmojiPicker).toBeTrue();
      component.toggleEmojiPicker();
      expect(component.showEmojiPicker).toBeFalse();
    });

    it('should add emoji to comment', () => {
      component.newCommentForm.setValue({ content: 'Hello ' });
      component.addSimpleEmoji('😊');
      expect(component.contentCtrl?.value).toBe('Hello 😊');
      expect(component.showEmojiPicker).toBeFalse();
    });

    it('should toggle edit emoji picker', () => {
      component.toggleEditEmojiPicker();
      expect(component.showEditEmojiPicker).toBeTrue();
      component.toggleEditEmojiPicker();
      expect(component.showEditEmojiPicker).toBeFalse();
    });

    it('should toggle reply emoji picker', () => {
      component.toggleReplyEmojiPicker();
      expect(component.showReplyEmojiPicker).toBeTrue();
      component.toggleReplyEmojiPicker();
      expect(component.showReplyEmojiPicker).toBeFalse();
    });

    it('should add edit emoji', () => {
      component.editContent = 'Hello ';
      component.addEditEmoji('😊');
      expect(component.editContent).toBe('Hello 😊');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: THREAD EXPANSION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Thread expansion', () => {
    it('should toggle replies', () => {
      component.toggleReplies(1);
      expect(component.expandedCommentIds.has(1)).toBeTrue();
      component.toggleReplies(1);
      expect(component.expandedCommentIds.has(1)).toBeFalse();
    });

    it('should check if replies are expanded', () => {
      component.expandedCommentIds.add(1);
      expect(component.hasRepliesExpanded(1)).toBeTrue();
      expect(component.hasRepliesExpanded(2)).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MODAL ACTIONS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Modal actions', () => {
    it('should return modal actions for contact', () => {
      component.currentUserId = 1;
      component.data.isUserAd = () => false;
      const actions = component.modalActions;
      expect(actions.length).toBe(1);
      expect(actions[0].id).toBe('contact');
    });

    it('should not show contact button for own ad', () => {
      component.currentUserId = 2;
      component.data.isUserAd = () => true;
      const actions = component.modalActions;
      expect(actions.length).toBe(0);
    });

    it('should handle modal action', () => {
      const openContactSpy = spyOn(component, 'openContactModal');
      component.onModalAction('contact');
      expect(openContactSpy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: DIALOG CLOSE TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Dialog close', () => {
    it('should close dialog', fakeAsync(() => {
      component.newCommentForm.setValue({ content: '' });
      component.onClose();
      tick(100);
      expect(mockDialogRef.close).toHaveBeenCalled();
    }));

    it('should show confirmation on unsaved changes', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }),
      );

      component.newCommentForm.setValue({ content: 'unsaved' });
      component.newCommentForm.markAsDirty();

      component.onClose();
      tick(100);

      expect(swalSpy).toHaveBeenCalled();
      expect(swalSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Unsaved Changes',
          text: 'You have unsaved changes. Are you sure you want to close?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, close it!',
          cancelButtonText: 'Cancel',
        }),
      );
      expect(mockDialogRef.close).toHaveBeenCalled();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: UTILITY FUNCTIONS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Utility functions', () => {
    it('should format date', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(component.formatDate(date.toISOString())).toBe(date.toISOString());
    });

    it('should track by comment id', () => {
      expect(component.trackByCommentId(0, { id: 5 } as any)).toBe(5);
    });

    it('should get reply tooltip', () => {
      const comment = { depthLevel: 1, user: { displayName: 'John' } } as any;
      expect(component.getReplyTooltip(comment)).toBe('Reply');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: PERMISSION CHECKS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Permission checks', () => {
    const comment = {
      id: 1,
      user: { userId: 1 },
      children: [],
    } as any;

    beforeEach(() => {
      component.currentUserId = 1;
    });

    it('should show menu for own comment', () => {
      expect(component.shouldShowMenu(comment, 0)).toBeTrue();
    });

    it('should hide menu at max depth without permissions', () => {
      component.currentUserId = 2;
      expect(component.shouldShowMenu(comment, 10)).toBeFalse();
    });

    it('should check if user replied', () => {
      const commentWithReply = {
        ...comment,
        children: [{ user: { userId: 1 }, active: true }],
      } as any;
      expect(component.hasUserReplied(commentWithReply)).toBeTrue();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CLEANUP TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Cleanup', () => {
    it('should cleanup on destroy', () => {
      const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(commentService.disconnectWebSocket).toHaveBeenCalled();
      expect(commentService.clearComments).toHaveBeenCalled();
    });
  });
});