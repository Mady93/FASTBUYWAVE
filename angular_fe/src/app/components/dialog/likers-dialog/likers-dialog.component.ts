import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LikeUserDTO } from 'src/app/interfaces/dtos/like-user.dto';
import { AdvertisementLikesService } from 'src/app/services/path/likes/advertisement-likes.service';

/**
 * @category Dialogs
 * 
 * @description
 * Dialog component that displays the list of users who liked a specific advertisement.
 * Fetches likes from the AdvertisementLikesService and displays them with loading state.
 * 
 * @author Popa Madalina Mariana 
 * @version 0.0.0
 * 
 * @example
 * this.dialog.open(LikersDialogComponent, {
 *   data: { advertisementId: 123, title: 'Users who liked this ad' }
 * });
 */
@Component({
  selector: 'app-likers-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './likers-dialog.component.html',
  styleUrl: './likers-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LikersDialogComponent implements OnInit {

   /** 
   * @description
   * Dialog data injected: advertisement ID and title of the dialog.
   */
  data = inject(MAT_DIALOG_DATA) as { advertisementId: number; title: string };

  /** 
   * @description
   * Service responsible for fetching likes for a given advertisement.
   */
  private likeService = inject(AdvertisementLikesService);

  /** 
   * @description
   * ChangeDetectorRef to manually trigger change detection after asynchronous operations.
   */
  private cdr = inject(ChangeDetectorRef);
  
  /** 
   * @description
   * Array containing the users who liked the advertisement.
   */
  likers: LikeUserDTO[] = [];

  /** 
   * @description
   * Loading state while fetching the likers from the server.
   */
  isLoading = true;

   /**
   * @inheritdoc
   * @description
   * Lifecycle hook that initializes the component.
   * Calls `fetchLikers` to retrieve the list of users who liked the advertisement.
   */
  ngOnInit(): void {
    this.fetchLikers();
  }

  /**
   * @description
   * Fetches the list of users who liked the advertisement.
   * Updates the `likers` array and sets the loading state.
   * Handles errors by resetting the array and clearing the loading flag.
   */
  private fetchLikers(): void {
    this.isLoading = true;
    this.likeService.getLikesByAdvertisement(this.data.advertisementId).subscribe({
      next: (response) => {
        this.likers = response.data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching likers:', err.message);
        this.likers = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}