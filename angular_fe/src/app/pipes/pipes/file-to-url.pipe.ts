import { Pipe, PipeTransform } from '@angular/core';

/**
 * @category Pipes
 * 
 * Pipe that converts a File object into a temporary object URL.
 *
 * Useful for previewing local files (e.g., images) before uploading them
 * to the backend.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Pipe({
  name: 'fileToUrl',
  standalone: true,
})
export class FileToUrlPipe implements PipeTransform {
  /**
   * Transforms a File object into a browser-generated object URL.
   *
   * @param file - File object to convert
   * @returns A temporary URL string or empty string if file is null
   */
  transform(file: File | null): string {
    return file ? URL.createObjectURL(file) : '';
  }
}
