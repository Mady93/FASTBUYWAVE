import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * @category Utils
 * 
 * @description Displays a snackbar with a message at the top center of the screen for 3 seconds.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {MatSnackBar} snackBar - The Angular Material MatSnackBar service.
 * @param {string} message - The message to display in the snackbar.
 *
 * @example
 * showSnackBar(this.snackBar, 'Operation successful!');
 */
export function showSnackBar(snackBar: MatSnackBar, message: string): void {
  snackBar.open(message, '❌', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  });
}
