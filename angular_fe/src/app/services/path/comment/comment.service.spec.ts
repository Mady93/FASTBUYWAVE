import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiConfigService } from '../../api-config/api-config.service';
import { CommentTreeDTO } from 'src/app/interfaces/dtos/comment/comment_dto';
import { provideHttpClient } from '@angular/common/http';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  let apiConfig: ApiConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        provideHttpClientTesting(),
        provideHttpClient(),
        {
          provide: ApiConfigService,
          useValue: { apiComments: '/api/comments', getBaseUrl: () => 'http://localhost:8080' },
        },
      ],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
    apiConfig = TestBed.inject(ApiConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new root comment if not already processed', () => {
    const newComment: CommentTreeDTO = {
      id: 1,
      content: 'Hello World',
      createdAt: new Date(),
      user: {
        userId: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        displayName: '',
        registrationDate: new Date(),
        lastLogin: null,
      },
      children: [],
      active: true,
      directRepliesCount: 0,
      totalRepliesCount: 0,
      depthLevel: 0,
    };

    expect(service.getCurrentComments().length).toBe(0);

    // Simulate WebSocket NEW_COMMENT
    (service as any).handleNewComment(newComment);

    const currentComments = service.getCurrentComments();
    expect(currentComments.length).toBe(1);
    expect(currentComments[0].id).toBe(1);
    expect(currentComments[0].user.displayName).toBe('John Doe');

    // Duplicate check
    (service as any).handleNewComment(newComment);
    expect(service.getCurrentComments().length).toBe(1);
  });

  it('should correctly add a reply to a parent comment', () => {
    const parentComment: CommentTreeDTO = {
      id: 1,
      content: 'Parent comment',
      createdAt: new Date(),
      user: {
        userId: 1,
        email: 'parent@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        displayName: '',
        registrationDate: new Date(),
        lastLogin: null,
      },
      children: [],
      active: true,
      directRepliesCount: 0,
      totalRepliesCount: 0,
      depthLevel: 0,
    };

    const replyComment: CommentTreeDTO = {
      id: 2,
      content: 'This is a reply',
      createdAt: new Date(),
      user: {
        userId: 2,
        email: 'reply@example.com',
        firstName: 'Bob',
        lastName: 'Brown',
        displayName: '',
        registrationDate: new Date(),
        lastLogin: null,
      },
      children: [],
      active: true,
      directRepliesCount: 0,
      totalRepliesCount: 0,
      depthLevel: 1,
    };

    (service as any).handleNewComment(parentComment);
    (service as any).handleNewReply(replyComment, parentComment.id!);

    const currentComments = service.getCurrentComments();
    expect(currentComments.length).toBe(1);
    expect(currentComments[0].children!.length).toBe(1);
    expect(currentComments[0].children![0].id).toBe(2);
    expect(currentComments[0].directRepliesCount).toBe(1);
    expect(currentComments[0].totalRepliesCount).toBe(1);
  });
});