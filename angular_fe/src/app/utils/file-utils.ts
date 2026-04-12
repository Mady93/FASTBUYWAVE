/**
 * @category Utils
 * 
 * @description Filters newly added files by removing duplicates compared to existing files
 * and limits the total number of files to a maximum allowed.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param existingFiles - Array of already selected/existing files.
 * @param newFiles - Array of newly added files to filter.
 * @param maxFiles - Maximum total number of files allowed.
 * @returns An object containing:
 *   - filteredFiles: new files filtered to remove duplicates and limited to available slots,
 *   - rejectedFiles: files discarded because they were duplicates.
 *
 * @example
 * const { filteredFiles, rejectedFiles } = filterNewFiles(existingFiles, newFiles, 5);
 */
export function filterNewFiles(
  existingFiles: File[],
  newFiles: File[],
  maxFiles: number,
): { filteredFiles: File[]; rejectedFiles: File[] } {
  const filteredFiles: File[] = [];
  const rejectedFiles: File[] = [];

  for (const file of newFiles) {
    const isDuplicate = existingFiles.some(
      (f) => f.name === file.name && f.type === file.type,
    );
    if (!isDuplicate) {
      filteredFiles.push(file);
    } else {
      rejectedFiles.push(file);
    }
  }

  const availableSlots = maxFiles - existingFiles.length;
  return {
    filteredFiles: filteredFiles.slice(0, availableSlots),
    rejectedFiles,
  };
}

/**
 * @category Utils
 * 
 * @description Converts a local asset (e.g., an image) to a Base64 Data URL.
 *
 * Useful for displaying images locally in Angular/React components
 * without relying on a public URL.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param assetPath - The path to the asset (e.g., '/assets/image.jpg').
 * @returns A promise that resolves to the Base64 Data URL representation of the asset.
 *
 * @example
 * const dataUrl = await convertAssetToDataURL('/assets/logo.png');
 * imgElement.src = dataUrl;
 */
export async function convertAssetToDataURL(
  assetPath: string,
): Promise<string> {
  try {
    const response = await fetch(assetPath);
    const blob = await response.blob();

    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting asset to DataURL:', error);
    return '';
  }
}

/**
 * @category Utils
 * 
 * @description Attempts to detect the MIME type of a base64-encoded image
 * by inspecting its initial byte signature (magic number).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param base64 - Base64-encoded image string (without data URI prefix).
 * @returns The detected MIME type (e.g., 'image/jpeg', 'image/png', 'image/webp').
 *
 * Supported formats:
 * - JPEG: starts with '/9j/'
 * - PNG: starts with 'iVBORw0KGgo'
 * - WebP: starts with 'UklGR'
 *
 * Defaults to 'image/jpeg' if no known signature is matched.
 *
 * @example
 * const mimeType = detectMimeType('/9j/4AAQSkZJRgABAQAAAQABAAD...');
 * console.log(mimeType); // → 'image/jpeg'
 */
export function detectMimeType(base64: string): string {
  const signature = base64.slice(0, 10);

  if (signature.startsWith('/9j/')) return 'image/jpeg';
  if (signature.startsWith('iVBORw0KGgo')) return 'image/png';
  if (signature.startsWith('UklGR')) return 'image/webp';

  return 'image/jpeg';
}
