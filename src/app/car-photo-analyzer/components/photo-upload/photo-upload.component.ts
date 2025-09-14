import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoUploadService, UploadedFile, ValidationResult } from '../../services/photo-upload.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css']
})
export class PhotoUploadComponent {
  @Output() fileUploaded = new EventEmitter<UploadedFile>();
  @Output() uploadError = new EventEmitter<string>();
  @Input() disabled = false;

  isDragActive = false;
  isProcessing = false;

  constructor(private photoUploadService: PhotoUploadService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragActive = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;

    if (this.disabled || this.isProcessing) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
    // Reset input value to allow selecting the same file again
    input.value = '';
  }

  onUploadButtonClick(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  private handleFile(file: File): void {
    if (this.disabled || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    this.photoUploadService.processUpload(file).subscribe({
      next: (uploadedFile: UploadedFile) => {
        this.isProcessing = false;
        this.fileUploaded.emit(uploadedFile);
      },
      error: (error: Error) => {
        this.isProcessing = false;
        this.uploadError.emit(error.message);
      }
    });
  }

  getMaxFileSizeFormatted(): string {
    return this.photoUploadService.formatFileSize(this.photoUploadService.getMaxFileSize());
  }

  getAllowedTypesText(): string {
    return 'JPG, JPEG, PNG';
  }
}