import { Observable } from 'rxjs';

/**
 * @category Utils
 * 
 * @description Converts a {@link Blob} object into a Base64-encoded string.
 * Useful for displaying images or files received from the backend on the frontend.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param blob - The {@link Blob} to convert.
 * @returns An {@link Observable} that emits the Base64 string (including the data URL prefix).
 *
 * @example
 * blobToBase64(fileBlob).subscribe(base64 => {
 *   console.log('Base64 string:', base64);
 * });
 */
export function blobToBase64(blob: Blob): Observable<string> {
  return new Observable<string>((observer) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      observer.next(reader.result as string);
      observer.complete();
    };

    reader.onerror = (error) => {
      observer.error(error);
    };

    reader.readAsDataURL(blob);
  });
}
