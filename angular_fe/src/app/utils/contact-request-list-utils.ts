import { Observable } from 'rxjs';
import { ContactMethod } from '../interfaces/dtos/contact/contactMethod.enum';
import { ContactRequestDTO } from '../interfaces/dtos/contact/contactRequestDTO.interface';
import { RequestStatus } from '../interfaces/dtos/contact/requestStatus.enum';
import { ApiConfigService } from '../services/api-config/api-config.service';

/**
 * @category Utils
 * 
 * @description Returns the display label for a request status.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param status - The status enum of the contact request.
 * @returns Uppercase string representation of the status.
 *
 * @example
 * getStatusLabel(RequestStatus.PENDING) // → "PENDING"
 */
export function getStatusLabel(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.PENDING:
      return 'PENDING';
    case RequestStatus.ACCEPTED:
      return 'ACCEPTED';
    case RequestStatus.REJECTED:
      return 'REJECTED';
    default:
      return status;
  }
}

/**
 * @category Utils
 * 
 * @description Returns a numeric priority for a request status to sort requests.
 *
 * Lower numbers indicate higher priority: PENDING < ACCEPTED < REJECTED.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param status - The request status enum value.
 * @returns Priority number (0 = highest, 99 = unknown/default).
 *
 * @example
 * getStatusPriority(RequestStatus.PENDING) // → 0
 */
export function getStatusPriority(status: RequestStatus): number {
  switch (status) {
    case RequestStatus.PENDING:
      return 0;
    case RequestStatus.ACCEPTED:
      return 1;
    case RequestStatus.REJECTED:
      return 2;
    default:
      return 99;
  }
}

/**
 * @category Utils
 * 
 * @description Returns the CSS badge class name corresponding to a request status.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param status - The contact request status.
 * @returns CSS class name for badge styling or empty string if unknown.
 *
 * @example
 * getBadgeColorClass(RequestStatus.PENDING) // → "badge-pending"
 */
export function getBadgeColorClass(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.PENDING:
      return 'badge-pending';
    case RequestStatus.ACCEPTED:
      return 'badge-accepted';
    case RequestStatus.REJECTED:
      return 'badge-rejected';
    default:
      return '';
  }
}

/**
 * @category Utils
 * 
 * @description Checks if a contact request is actionable (i.e., can be accepted or rejected).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @returns `true` if status is PENDING; otherwise `false`.
 */
export function isActionable(request: ContactRequestDTO): boolean {
  return request.status === RequestStatus.PENDING;
}

/**
 * @category Utils
 * 
 * @description Checks if the current user is the receiver of a contact request.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns `true` if current user is receiver; otherwise `false`.
 */
export function isReceiver(
  request: ContactRequestDTO,
  currentUserId: number | null,
): boolean {
  return currentUserId !== null && request.receiver?.userId === currentUserId;
}

/**
 * @category Utils
 * 
 * @description Checks if the current user is the sender of a contact request.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns `true` if current user is sender; otherwise `false`.
 */
export function isSender(
  request: ContactRequestDTO,
  currentUserId: number | null,
): boolean {
  return currentUserId !== null && request.sender?.userId === currentUserId;
}

/**
 * @category Utils
 * 
 * @description Determines if a meeting request can be accepted by the current user.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns `true` if user can accept a meeting request; otherwise `false`.
 */
export function canAcceptMeeting(
  request: ContactRequestDTO,
  currentUserId: number | null,
): boolean {
  return (
    isReceiver(request, currentUserId) &&
    request.preferredContactMethod === ContactMethod.MEETING &&
    isActionable(request)
  );
}

/**
 * @category Utils
 * 
 * @description Determines if a non-meeting request can be closed by the current user.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns `true` if user can close a non-meeting request; otherwise `false`.
 */
export function canCloseNonMeeting(
  request: ContactRequestDTO,
  currentUserId: number | null,
): boolean {
  return (
    isReceiver(request, currentUserId) &&
    request.preferredContactMethod !== ContactMethod.MEETING &&
    isActionable(request)
  );
}

/**
 * @category Utils
 * 
 * @description Determines if the current user can reject a contact request.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns `true` if user can reject the request; otherwise `false`.
 */
export function canReject(
  request: ContactRequestDTO,
  currentUserId: number | null,
): boolean {
  return isReceiver(request, currentUserId) && isActionable(request);
}

/**
 * @category Utils
 * 
 * @description Determines if the request can be hidden from the current user's view.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns `true` if the request can be hidden; otherwise `false`.
 */
export function canHide(
  request: ContactRequestDTO,
  currentUserId: number | null,
): boolean {
  if (request.status === RequestStatus.PENDING) return false;
  if (
    request.status !== RequestStatus.ACCEPTED &&
    request.status !== RequestStatus.REJECTED
  )
    return false;
  if (isSender(request, currentUserId) && !request.hiddenBySender) return true;
  if (isReceiver(request, currentUserId) && !request.hiddenByReceiver)
    return true;
  return false;
}

/**
 * @category Utils
 * 
 * @description Returns the list of available actions for the current user on a request.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param request - The contact request object.
 * @param currentUserId - The ID of the current user.
 * @returns Array of action labels (e.g., accept, reject, hide).
 */
export function getAvailableActions(
  request: ContactRequestDTO,
  currentUserId: number | null,
): string[] {
  const actions: string[] = [];

  if (
    canAcceptMeeting(request, currentUserId) ||
    canCloseNonMeeting(request, currentUserId)
  ) {
    actions.push('✔ Accept request');
  }

  if (canReject(request, currentUserId)) {
    actions.push('✖ Reject request');
  }

  if (canHide(request, currentUserId)) {
    actions.push('🗑 Hide request from your view');
  }

  return actions;
}

/**
 * @category Utils
 * 
 * @description Parses a request subject into label and product parts.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param subject - The raw subject string.
 * @returns Object containing `label` and `product`.
 *
 * @example
 * parseSubject("Interested in: iPhone 14")
 * // → { label: "Interested in:", product: "iPhone 14" }
 */
export function parseSubject(subject: string): {
  label: string;
  product: string;
} {
  const parts = subject.split(':');
  if (parts.length > 1) {
    return { label: parts[0] + ':', product: parts.slice(1).join(':').trim() };
  }
  return { label: 'Interested in:', product: subject };
}

/**
 * @category Utils
 * 
 * @description Returns the full profile image URL.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param profileImageUrl - The image path or full URL.
 * @param apiConfigService - API configuration service containing base URL.
 * @returns Full image URL string.
 */
export function getFullImageUrl(
  profileImageUrl: string,
  apiConfigService: ApiConfigService,
): string {
  if (profileImageUrl.startsWith('http')) return profileImageUrl;
  return `${apiConfigService.apiProfile}${profileImageUrl}`;
}

/**
 * @category Utils
 * 
 * @description Converts a Blob to a Base64 string observable.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param blob - The Blob to convert.
 * @returns Observable emitting Base64 string representation.
 */
export function convertBlobToBase64(blob: Blob): Observable<string> {
  return new Observable((observer) => {
    const reader = new FileReader();
    reader.onload = () => {
      observer.next(reader.result as string);
      observer.complete();
    };
    reader.onerror = (error) => observer.error(error);
    reader.readAsDataURL(blob);
  });
}

/**
 * @category Utils
 * 
 * @description Returns the empty state message for a given status and method filter.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param statusFilter - RequestStatus or 'ALL'.
 * @param methodFilter - ContactMethod or 'ALL'.
 * @returns User-friendly empty state message string.
 */
export function getEmptyStateMessage(
  statusFilter: RequestStatus | 'ALL',
  methodFilter: ContactMethod | 'ALL',
): string {
  const statusLabel =
    statusFilter !== 'ALL'
      ? getStatusLabel(statusFilter as RequestStatus).toLowerCase()
      : null;

  const methodLabel =
    methodFilter !== 'ALL' ? (methodFilter as string).toLowerCase() : null;

  if (statusLabel && methodLabel)
    return `No ${statusLabel} requests via ${methodLabel}`;
  if (statusLabel) return `No ${statusLabel} requests found`;
  if (methodLabel) return `No requests via ${methodLabel} found`;
  return 'No results found';
}

/**
 * @category Utils
 * 
 * @description Returns the empty state subtitle based on applied filters.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param statusFilter - RequestStatus or 'ALL'.
 * @param methodFilter - ContactMethod or 'ALL'.
 * @returns Subtitle string guiding the user.
 */
export function getEmptyStateSubtitle(
  statusFilter: RequestStatus | 'ALL',
  methodFilter: ContactMethod | 'ALL',
): string {
  if (statusFilter !== 'ALL' || methodFilter !== 'ALL') {
    return 'Try removing some filters to see more results';
  }
  return 'Try adjusting your search or filter settings';
}

/**
 * @category Utils
 * 
 * @description Returns an appropriate error message when rejecting a request fails.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param error - The error object returned from the API.
 * @returns User-friendly error string.
 */
export function getRejectErrorMessage(error: any): string {
  if (error?.error?.message) return error.error.message;
  if (error?.status === 404) return 'Request not found';
  if (error?.status === 403) return 'Not authorized to reject this request';
  if (error?.status === 400) return 'Request already processed';
  return 'Error rejecting request';
}
