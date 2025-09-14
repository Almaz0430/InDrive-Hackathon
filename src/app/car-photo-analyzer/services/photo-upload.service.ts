import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  uploadTimestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoUploadService {
  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  /**
   * Validates if the uploaded file meets the requirements
   * @param file - The file to validate
   * @returns ValidationResult with validation status and errors
   */
  validateFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file type
    if (!this.allowedTypes.includes(file.type.toLowerCase())) {
      errors.push('Поддерживаются только файлы .jpg, .jpeg, .png');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push('Размер файла не должен превышать 10MB');
    }

    // Check if file is actually an image by checking the file name extension as well
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.jpg') || 
                             fileName.endsWith('.jpeg') || 
                             fileName.endsWith('.png');
    
    if (!hasValidExtension) {
      errors.push('Файл должен иметь расширение .jpg, .jpeg или .png');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a preview URL for the uploaded file
   * @param file - The file to create preview for
   * @returns Preview URL string
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Processes the file upload with validation
   * @param file - The file to process
   * @returns Observable<UploadedFile> or error
   */
  processUpload(file: File): Observable<UploadedFile> {
    const validation = this.validateFile(file);
    
    if (!validation.isValid) {
      return throwError(() => new Error(validation.errors.join(', ')));
    }

    try {
      const previewUrl = this.createPreviewUrl(file);
      const uploadedFile: UploadedFile = {
        file,
        previewUrl,
        uploadTimestamp: new Date()
      };

      // Simulate a small delay for processing
      return of(uploadedFile).pipe(delay(100));
    } catch (error) {
      return throwError(() => new Error('Не удалось загрузить файл. Попробуйте другой.'));
    }
  }

  /**
   * Cleans up the preview URL to prevent memory leaks
   * @param previewUrl - The URL to revoke
   */
  revokePreviewUrl(previewUrl: string): void {
    URL.revokeObjectURL(previewUrl);
  }

  /**
   * Gets the list of allowed file types for display
   * @returns Array of allowed MIME types
   */
  getAllowedTypes(): string[] {
    return [...this.allowedTypes];
  }

  /**
   * Gets the maximum file size in bytes
   * @returns Maximum file size in bytes
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Formats file size for display
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}