import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  retry,
  tap,
  timer,
} from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import { CommentTreeDTO } from 'src/app/interfaces/dtos/comment/comment_dto';
import { UserProfileDTO } from 'src/app/interfaces/dtos/comment/user_profile_dto.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Provides comprehensive comment management functionality including CRUD operations,
 * real-time updates via WebSocket, and comment tree manipulation. The service maintains
 * a hierarchical structure of comments and their replies with automatic duplicate prevention.
 *
 * @property {Observable<CommentTreeDTO[]>} comments$ - Stream of current comment tree
 * @property {Observable<boolean>} loading$ - Stream indicating loading state
 *
 * @example
 * ```typescript
 * // Inject in component
 * constructor(private commentService: CommentService) {}
 *
 * // Fetch comments for an advertisement
 * this.commentService.getCommentsByAdvertisement(123).subscribe();
 *
 * // Listen for real-time updates
 * this.commentService.comments$.subscribe(comments => {
 *   console.log('Comments updated:', comments);
 * });
 *
 * // Clean up on component destroy
 * ngOnDestroy() {
 *   this.commentService.clearComments();
 * }
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Subject holding the current state of the comment tree
   */
  private commentsSubject = new BehaviorSubject<CommentTreeDTO[]>([]);

  /**
   * @description Subject tracking the loading state for comment operations
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Observable emitting the current list of comments
   */
  public comments$ = this.commentsSubject.asObservable();

  /**
   * @description Observable emitting the loading state
   */
  public loading$ = this.loadingSubject.asObservable();

  /**
   * @description STOMP client instance for WebSocket communication
   */
  private stompClient: any;

  /**
   * @description Flag indicating WebSocket connection status
   */
  private isConnected = false;

  /**
   * @description Promise tracking WebSocket connection initialization
   */
  private connectionPromise: Promise<void> | null = null;

  /**
   * @description Currently active advertisement ID for WebSocket subscription
   */
  private currentAdvertisementId: number | null = null;

  /**
   * @description Set of processed comment IDs to prevent duplicate processing
   */
  private processedCommentIds = new Set<number>();

  // ==================== WEBSOCKET METHODS ====================

  /**
   * @description Initializes WebSocket connection for a specific advertisement.
   * If already connected to the same advertisement, the connection is reused.
   *
   * @param {number} advertisementId - ID of the advertisement to connect to
   * @returns {void}
   *
   * @example
   * ```typescript
   * this.commentService.initializeWebSocket(123);
   * ```
   */
  initializeWebSocket(advertisementId: number): void {
    if (this.currentAdvertisementId === advertisementId && this.isConnected) {
      return;
    }

    this.currentAdvertisementId = advertisementId;
    this.connectWebSocket(advertisementId);
  }

  /**
   * @description Disconnects the active WebSocket connection and clears all related state.
   * Resets connection flags and clears the processed comments set.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * this.commentService.disconnectWebSocket();
   * ```
   */
  disconnectWebSocket(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate().then(() => {
        console.log('WebSocket disconnected');
      });
    }
    this.isConnected = false;
    this.connectionPromise = null;
    this.currentAdvertisementId = null;
    this.stompClient = null;
    // Pulisco il set dei commenti processati
    this.processedCommentIds.clear();
  }

  /**
   * @description Establishes WebSocket connection using STOMP over SockJS.
   * Configures automatic reconnection, heartbeats, and subscribes to advertisement-specific topics.
   *
   * @param {number} advertisementId - ID of the advertisement to subscribe to
   * @returns {void}
   */
  private connectWebSocket(advertisementId: number): void {
    if (this.connectionPromise) {
      return;
    }

    const backendBaseUrl = this.apiConfig.getBaseUrl();

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS(`${backendBaseUrl}/ws-comments`),
          debug: (str: string) => console.log('STOMP:', str),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame: IFrame) => {
          console.log('WebSocket Connected:', frame);
          this.isConnected = true;

          this.stompClient!.subscribe(
            `/topic/advertisement/${advertisementId}/comments`,
            (message: IMessage) => {
              this.handleWebSocketNotification(JSON.parse(message.body));
            },
          );

          resolve();
        };

        this.stompClient.onStompError = (frame: IFrame) => {
          console.error('STOMP error:', frame);
          this.isConnected = false;
          this.connectionPromise = null;
          reject(frame);
        };

        this.stompClient.onWebSocketError = (event: Event) => {
          console.error('WebSocket error:', event);
          this.isConnected = false;
          this.connectionPromise = null;
          reject(event);
        };

        this.stompClient.activate();
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.connectionPromise = null;
        this.stompClient = null;
        reject(error);
      }
    });
  }

  /**
   * @description Processes incoming WebSocket notifications.
   * Handles different notification types: NEW_COMMENT, NEW_REPLY, UPDATE_COMMENT, DELETE_COMMENT.
   *
   * @param {any} notification - WebSocket notification object
   * @returns {void}
   */
  private handleWebSocketNotification(notification: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] WebSocket notification:`, {
      type: notification.type,
      commentId: notification.commentId || notification.comment?.id,
      advertisementId: notification.advertisementId,
    });

    if (!notification || !notification.type) {
      console.warn('Invalid notification received:', notification);
      return;
    }

    // Verifico che la notifica sia per l'annuncio corrente
    if (notification.advertisementId !== this.currentAdvertisementId) {
      console.log('Ignoring notification for different advertisement');
      return;
    }

    switch (notification.type) {
      case 'NEW_COMMENT':
        if (notification.comment) {
          console.log('Processing NEW_COMMENT:', notification.comment.id);
          this.handleNewComment(notification.comment);
        }
        break;
      case 'NEW_REPLY':
        if (notification.comment && notification.parentId) {
          console.log(
            'Processing NEW_REPLY:',
            notification.comment.id,
            'to parent:',
            notification.parentId,
          );
          this.handleNewReply(notification.comment, notification.parentId);
        }
        break;
      case 'UPDATE_COMMENT':
        if (notification.comment) {
          console.log('Processing UPDATE_COMMENT:', notification.comment.id);
          this.handleUpdateComment(notification.comment);
        }
        break;
      case 'DELETE_COMMENT':
        if (notification.commentId) {
          console.log('Processing DELETE_COMMENT:', notification.commentId);
          this.handleDeleteComment(notification.commentId);
        }
        break;
      default:
        console.warn('Unknown notification type:', notification.type);
    }
  }

  /**
   * @description Handles new reply notifications with duplicate prevention.
   * Adds the reply to the comment tree, updates counters, and scrolls to the new reply.
   *
   * @param {CommentTreeDTO} newReply - The new reply to add
   * @param {number} parentId - ID of the parent comment
   * @returns {void}
   */
  private handleNewReply(newReply: CommentTreeDTO, parentId: number): void {
    const currentComments = this.getCurrentComments();

    if (!newReply.id) {
      console.error('Reply without ID received');
      return;
    }

    // Controllo se già processato
    if (this.processedCommentIds.has(newReply.id)) {
      console.log('Reply already processed:', newReply.id);
      return;
    }

    // Controllo se esiste già nell'albero
    if (this.findCommentById(newReply.id, currentComments)) {
      console.log('Reply already exists in tree:', newReply.id);
      return;
    }

    this.processCommentDisplayName(newReply);
    const updatedComments = this.addReplyRecursive(
      currentComments,
      newReply,
      parentId,
    );
    const sortedComments = this.sortCommentsByCreatedAt(updatedComments);

    setTimeout(() => {
      document
        .querySelector('#comment-' + newReply.id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1000);

    const updatedWithCounters = this.recalculateReplyCounts(sortedComments);

    this.processedCommentIds.add(newReply.id);

    this.commentsSubject.next(updatedWithCounters);
  }

  /**
   * @description Handles new comment notifications with duplicate prevention.
   * Adds the comment to the root of the comment tree.
   *
   * @param {CommentTreeDTO} newComment - The new comment to add
   * @returns {void}
   */
  private handleNewComment(newComment: CommentTreeDTO): void {
    const currentComments = this.getCurrentComments();

    if (!newComment.id) {
      console.error('Comment without ID received');
      return;
    }

    // Controllo se già processato
    if (this.processedCommentIds.has(newComment.id)) {
      console.log('Comment already processed:', newComment.id);
      return;
    }

    if (currentComments.some((comment) => comment.id === newComment.id)) {
      console.log('Comment already exists:', newComment.id);
      return;
    }

    this.processCommentDisplayName(newComment);
    const updatedComments = [...currentComments, newComment];
    const sortedComments = this.sortCommentsByCreatedAt(updatedComments);

    // Mark come processato
    this.processedCommentIds.add(newComment.id);

    this.commentsSubject.next(sortedComments);
  }

  /**
   * @description Handles comment update notifications.
   * Updates the existing comment in the tree with new content.
   *
   * @param {CommentTreeDTO} updatedComment - The updated comment data
   * @returns {void}
   */
  private handleUpdateComment(updatedComment: CommentTreeDTO): void {
    const currentComments = this.getCurrentComments();

    if (!updatedComment.id) {
      console.error('Cannot update comment without ID');
      return;
    }

    this.processCommentDisplayName(updatedComment);
    const updatedComments = this.updateCommentRecursive(
      currentComments,
      updatedComment,
    );

    this.commentsSubject.next(updatedComments);
  }

  /**
   * @description Handles comment deletion notifications.
   * Refreshes all comments from the server to ensure consistency.
   *
   * @param {number} commentId - ID of the deleted comment
   * @returns {void}
   */
  private handleDeleteComment(commentId: number): void {
    console.log('Handling delete for comment:', commentId);

    // Invece di fare soft delete locale, ricarica tutto dal server
    if (this.currentAdvertisementId) {
      this.refreshComments(this.currentAdvertisementId);
    }
  }

  /**
   * @description Recursively searches for a comment by ID in the comment tree.
   *
   * @param {number | undefined} commentId - ID of the comment to find
   * @param {CommentTreeDTO[]} comments - Array of comments to search in
   * @returns {CommentTreeDTO | null} Found comment or null
   */
  private findCommentById(
    commentId: number | undefined,
    comments: CommentTreeDTO[],
  ): CommentTreeDTO | null {
    if (!commentId) {
      return null;
    }

    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }
      if (comment.children && comment.children.length > 0) {
        const found = this.findCommentById(commentId, comment.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * @description Recalculates reply counts for all comments in the tree.
   * Updates both direct and total reply counts.
   *
   * @param {CommentTreeDTO[]} comments - Array of comments to process
   * @returns {CommentTreeDTO[]} Comments with updated reply counts
   */
  private recalculateReplyCounts(comments: CommentTreeDTO[]): CommentTreeDTO[] {
    return comments.map((comment) => {
      const activeChildren =
        comment.children?.filter((c) => c.active !== false) || [];

      return {
        ...comment,
        directRepliesCount: activeChildren.length,
        totalRepliesCount: this.countTotalReplies(activeChildren),
        children: this.recalculateReplyCounts(activeChildren),
      };
    });
  }

  /**
   * @description Recursively counts all replies in a comment tree.
   *
   * @param {CommentTreeDTO[]} comments - Array of comments to count
   * @returns {number} Total number of replies
   */
  private countTotalReplies(comments: CommentTreeDTO[]): number {
    let count = 0;
    for (const comment of comments) {
      if (comment.active !== false) {
        count += 1;
        if (comment.children && comment.children.length > 0) {
          count += this.countTotalReplies(comment.children);
        }
      }
    }
    return count;
  }

  /**
   * @description Creates an RxJS operator that implements exponential backoff retry logic.
   *
   * @template T
   * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
   * @returns {Function} RxJS operator function
   */
  private retryWithBackoff<T>(maxRetries: number = 3) {
    return (source: Observable<T>) =>
      source.pipe(
        retry({
          count: maxRetries,
          delay: (error, retryCount) => {
            // Backoff esponenziale: 1s, 2s, 4s
            const delayMs = Math.pow(2, retryCount - 1) * 1000;
            console.log(`Retry attempt ${retryCount} after ${delayMs}ms`);
            return timer(delayMs);
          },
        }),
      );
  }

  /**
   * @description Fetches all comments for a specific advertisement.
   * Initializes WebSocket connection and updates the comments subject.
   *
   * @param {number} advertisementId - ID of the advertisement
   * @returns {Observable<CommentTreeDTO[]>} Observable of comment tree
   *
   * @example
   * ```typescript
   * this.commentService.getCommentsByAdvertisement(123).subscribe({
   *   next: (comments) => console.log('Comments loaded:', comments),
   *   error: (error) => console.error('Failed to load comments:', error)
   * });
   * ```
   */
  getCommentsByAdvertisement(
    advertisementId: number,
  ): Observable<CommentTreeDTO[]> {
    this.loadingSubject.next(true);
    this.initializeWebSocket(advertisementId);
    const url = `${this.apiConfig.apiComments}/get/advertisement/${advertisementId}`;

    return this.http.get<CommentTreeDTO[]>(url).pipe(
      this.retryWithBackoff(3),
      tap((comments) => {
        const sortedComments = this.sortCommentsByCreatedAt(comments);
        this.processCommentsDisplayNames(sortedComments);
        this.markCommentsAsProcessed(sortedComments);
        this.commentsSubject.next(sortedComments);
      }),
      catchError((error) => {
        console.error('Errore nel caricamento commenti dopo retry:', error);
        this.commentsSubject.next([]);
        throw error;
      }),
      finalize(() => this.loadingSubject.next(false)),
    );
  }

  /**
   * @description Recursively marks comments as processed by adding their IDs to the processed set.
   *
   * @param {CommentTreeDTO[]} comments - Array of comments to mark
   * @returns {void}
   */
  private markCommentsAsProcessed(comments: CommentTreeDTO[]): void {
    for (const comment of comments) {
      if (comment.id) {
        this.processedCommentIds.add(comment.id);
      }
      if (comment.children && comment.children.length > 0) {
        this.markCommentsAsProcessed(comment.children);
      }
    }
  }

  /**
   * @description Checks if WebSocket connection is active.
   *
   * @returns {boolean} True if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.stompClient !== null;
  }

  /**
   * @description Attempts to reconnect WebSocket if disconnected.
   *
   * @returns {void}
   */
  reconnectWebSocket(): void {
    if (!this.isConnected && this.currentAdvertisementId) {
      console.log('Attempting to reconnect WebSocket...');
      this.connectWebSocket(this.currentAdvertisementId);
    }
  }

  /**
   * @description Creates a new root comment for an advertisement.
   *
   * @param {number} advertisementId - ID of the advertisement
   * @param {string} content - Comment content
   * @param {number} userId - ID of the user creating the comment
   * @returns {Observable<CommentTreeDTO>} Observable of the created comment
   *
   * @example
   * ```typescript
   * this.commentService.createRootComment(123, 'Great post!', 456).subscribe();
   * ```
   */
  createRootComment(
    advertisementId: number,
    content: string,
    userId: number,
  ): Observable<CommentTreeDTO> {
    const url = `${this.apiConfig.apiComments}/create/advertisement/${advertisementId}`;
    const params = new HttpParams()
      .set('content', content)
      .set('userId', userId.toString());

    return this.http.post<CommentTreeDTO>(url, null, { params }).pipe(
      tap((newComment) => {
        this.processCommentDisplayName(newComment);
        // WebSocket will handle the addition to avoid duplicates
      }),
    );
  }

  /**
   * @description Creates a new reply to an existing comment.
   *
   * @param {number} parentId - ID of the parent comment
   * @param {string} content - Reply content
   * @param {number} userId - ID of the user creating the reply
   * @returns {Observable<CommentTreeDTO>} Observable of the created reply
   *
   * @example
   * ```typescript
   * this.commentService.createReply(789, 'I agree!', 456).subscribe();
   * ```
   */
  createReply(
    parentId: number,
    content: string,
    userId: number,
  ): Observable<CommentTreeDTO> {
    const url = `${this.apiConfig.apiComments}/create/${parentId}/reply`;
    const params = new HttpParams()
      .set('content', content)
      .set('userId', userId.toString());

    return this.http.post<CommentTreeDTO>(url, null, { params }).pipe(
      tap((newReply) => {
        this.processCommentDisplayName(newReply);
        // WebSocket will handle the addition
      }),
    );
  }

  /**
   * @description Updates an existing comment.
   *
   * @param {number} commentId - ID of the comment to update
   * @param {string} content - Updated content
   * @param {number} userId - ID of the user making the update
   * @returns {Observable<CommentTreeDTO>} Observable of the updated comment
   *
   * @example
   * ```typescript
   * this.commentService.updateComment(789, 'Updated content', 456).subscribe();
   * ```
   */
  updateComment(
    commentId: number,
    content: string,
    userId: number,
  ): Observable<CommentTreeDTO> {
    const url = `${this.apiConfig.apiComments}/update/${commentId}`;
    const params = new HttpParams()
      .set('content', content)
      .set('userId', userId.toString());

    return this.http.put<CommentTreeDTO>(url, null, { params }).pipe(
      tap((updatedComment) => {
        this.processCommentDisplayName(updatedComment);
        // WebSocket will handle the update
      }),
    );
  }

  /**
   * @description Deletes a comment.
   *
   * @param {number} commentId - ID of the comment to delete
   * @param {number} userId - ID of the user deleting the comment
   * @returns {Observable<void>} Observable that completes when deletion is done
   *
   * @example
   * ```typescript
   * this.commentService.deleteComment(789, 456).subscribe();
   * ```
   */
  deleteComment(commentId: number, userId: number): Observable<void> {
    const url = `${this.apiConfig.apiComments}/delete/${commentId}`;
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.delete<void>(url, { params }).pipe(
      tap(() => {
        // WebSocket will handle the refresh
      }),
    );
  }

  /**
   * @description Gets the current comments from the BehaviorSubject.
   *
   * @returns {CommentTreeDTO[]} Current comment tree
   */
  getCurrentComments(): CommentTreeDTO[] {
    return this.commentsSubject.value;
  }

  /**
   * @description Manually refreshes comments from the server.
   *
   * @param {number} advertisementId - ID of the advertisement
   * @returns {void}
   *
   * @example
   * ```typescript
   * this.commentService.refreshComments(123);
   * ```
   */
  refreshComments(advertisementId: number): void {
    this.loadingSubject.next(true);
    this.http
      .get<CommentTreeDTO[]>(
        `${this.apiConfig.apiComments}/get/advertisement/${advertisementId}`,
      )
      .pipe(
        tap((comments) => {
          const sortedComments = this.sortCommentsByCreatedAt(comments);
          this.processCommentsDisplayNames(sortedComments);

          // ✅ Resetta e ricarica i commenti processati
          this.processedCommentIds.clear();
          this.markCommentsAsProcessed(sortedComments);

          this.commentsSubject.next(sortedComments);
        }),
        catchError((error) => {
          console.error('Errore nel refresh dei commenti:', error);
          this.commentsSubject.next([]);
          throw error;
        }),
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe();
  }

  /**
   * @description Clears all comments and disconnects WebSocket.
   *
   * @returns {void}
   */
  clearComments(): void {
    this.commentsSubject.next([]);
    this.processedCommentIds.clear();
    this.disconnectWebSocket();
  }

  /**
   * @description Formats a date string for display.
   *
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   *
   * @example
   * ```typescript
   * const formatted = this.commentService.formatDate('2024-01-15T10:30:00Z');
   * // Returns: "15 gen 2024, 10:30"
   * ```
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * @description Calculates statistics about the current comment tree.
   *
   * @returns {Object} Comment statistics
   * @returns {number} .total - Total number of comments including replies
   * @returns {number} .rootComments - Number of root comments
   *
   * @example
   * ```typescript
   * const stats = this.commentService.getCommentStats();
   * console.log(`Total comments: ${stats.total}, Root comments: ${stats.rootComments}`);
   * ```
   */
  getCommentStats() {
    const comments = this.getCurrentComments();
    const rootCommentsCount = comments.length;

    function countRecursively(comments: CommentTreeDTO[]): number {
      if (!comments || comments.length === 0) return 0;
      let count = comments.length;
      for (const c of comments) {
        count += countRecursively(c.children || []);
      }
      return count;
    }

    const totalCommentsCount = countRecursively(comments);

    return {
      total: totalCommentsCount,
      rootComments: rootCommentsCount,
    };
  }

  // ==================== PRIVATE TREE MANAGEMENT METHODS ====================

  /**
   * @description Recursively processes display names for all comments in a tree.
   *
   * @param {CommentTreeDTO[]} comments - Array of comments to process
   * @returns {void}
   */
  private processCommentsDisplayNames(comments: CommentTreeDTO[]): void {
    comments.forEach((comment) => {
      this.processCommentDisplayName(comment);
      if (comment.children) {
        this.processCommentsDisplayNames(comment.children);
      }
    });
  }

  /**
   * @description Ensures a comment has a display name, generating one if needed.
   *
   * @param {CommentTreeDTO} comment - Comment to process
   * @returns {void}
   */
  private processCommentDisplayName(comment: CommentTreeDTO): void {
    if (!comment.user.displayName) {
      comment.user.displayName = this.generateDisplayName(comment.user);
    }
  }

  /**
   * @description Generates a display name from user profile information.
   *
   * @param {UserProfileDTO} user - User profile data
   * @returns {string} Generated display name
   */
  private generateDisplayName(user: UserProfileDTO): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else {
      return user.email.split('@')[0];
    }
  }

  /**
   * @description Recursively adds a reply to the appropriate parent comment.
   *
   * @param {CommentTreeDTO[]} comments - Current comment tree
   * @param {CommentTreeDTO} newReply - Reply to add
   * @param {number} parentId - ID of the parent comment
   * @returns {CommentTreeDTO[]} Updated comment tree
   */
  private addReplyRecursive(
    comments: CommentTreeDTO[],
    newReply: CommentTreeDTO,
    parentId: number,
  ): CommentTreeDTO[] {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        const updatedComment = { ...comment };
        const updatedChildren = [...(updatedComment.children || []), newReply];
        updatedComment.children = this.sortCommentsByCreatedAt(updatedChildren);
        updatedComment.directRepliesCount =
          (updatedComment.directRepliesCount || 0) + 1;
        updatedComment.totalRepliesCount =
          (updatedComment.totalRepliesCount || 0) + 1;
        return updatedComment;
      } else if (comment.children && comment.children.length > 0) {
        const updatedComment = { ...comment };
        updatedComment.children = this.addReplyRecursive(
          updatedComment.children ?? [],
          newReply,
          parentId,
        );
        return updatedComment;
      }
      return comment;
    });
  }

  /**
   * @description Recursively updates a comment in the tree.
   *
   * @param {CommentTreeDTO[]} comments - Current comment tree
   * @param {CommentTreeDTO} updatedComment - Updated comment data
   * @returns {CommentTreeDTO[]} Updated comment tree
   */
  private updateCommentRecursive(
    comments: CommentTreeDTO[],
    updatedComment: CommentTreeDTO,
  ): CommentTreeDTO[] {
    return comments.map((comment) => {
      if (comment.id === updatedComment.id) {
        return { ...updatedComment, children: comment.children };
      } else if (comment.children && comment.children.length > 0) {
        return {
          ...comment,
          children: this.updateCommentRecursive(
            comment.children,
            updatedComment,
          ),
        };
      }
      return comment;
    });
  }

  /**
   * @description Sorts comments and their children by creation date (oldest first).
   *
   * @param {CommentTreeDTO[]} comments - Array of comments to sort
   * @returns {CommentTreeDTO[]} Sorted comment array
   */
  private sortCommentsByCreatedAt(
    comments: CommentTreeDTO[],
  ): CommentTreeDTO[] {
    if (!comments || comments.length === 0) return [];

    return comments
      .map((comment) => ({
        ...comment,
        children: comment.children
          ? this.sortCommentsByCreatedAt(comment.children)
          : [],
      }))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
  }
}
