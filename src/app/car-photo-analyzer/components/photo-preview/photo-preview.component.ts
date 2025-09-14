import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, RotateCcw, Trash2, Camera, Loader2 } from 'lucide-angular';
import { UploadedFile } from '../../services/photo-upload.service';

@Component({
  selector: 'app-photo-preview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './photo-preview.component.html',
  styleUrls: ['./photo-preview.component.css']
})
export class PhotoPreviewComponent {
  @Input() uploadedFile: UploadedFile | null = null;
  @Input() isAnalyzing: boolean = false;
  @Output() removePhoto = new EventEmitter<void>();
  @Output() replacePhoto = new EventEmitter<void>();

  // Иконки
  readonly ReplaceIcon = RotateCcw;
  readonly RemoveIcon = Trash2;
  readonly CameraIcon = Camera;
  readonly LoaderIcon = Loader2;

  /**
   * Обработчик клика по кнопке удаления фото
   */
  onRemovePhoto(): void {
    this.removePhoto.emit();
  }

  /**
   * Обработчик клика по кнопке замены фото
   */
  onReplacePhoto(): void {
    this.replacePhoto.emit();
  }

  /**
   * Проверяет, есть ли загруженное фото
   */
  hasPhoto(): boolean {
    return this.uploadedFile !== null;
  }

  /**
   * Форматирует размер файла для отображения
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Форматирует время загрузки
   */
  formatUploadTime(timestamp: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(timestamp);
  }

  /**
   * Получает расширение файла
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || '';
  }
}