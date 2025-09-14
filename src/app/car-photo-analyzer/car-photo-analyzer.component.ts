import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoUploadComponent } from './components/photo-upload/photo-upload.component';
import { PhotoPreviewComponent } from './components/photo-preview/photo-preview.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { UploadedFile } from './services/photo-upload.service';
import { AnalysisResult, AnalysisService } from './services/analysis.service';

interface CarPhotoAnalyzerState {
  uploadedFile: UploadedFile | null;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;
}

@Component({
  selector: 'app-car-photo-analyzer',
  standalone: true,
  imports: [CommonModule, PhotoUploadComponent, PhotoPreviewComponent, ResultsDisplayComponent],
  templateUrl: './car-photo-analyzer.component.html',
  styleUrl: './car-photo-analyzer.component.css'
})
export class CarPhotoAnalyzerComponent {
  state: CarPhotoAnalyzerState = {
    uploadedFile: null,
    isAnalyzing: false,
    analysisResult: null,
    error: null
  };

  constructor(private analysisService: AnalysisService) {}

  onFileUploaded(uploadedFile: UploadedFile): void {
    this.state = {
      ...this.state,
      uploadedFile,
      isAnalyzing: false,
      analysisResult: null,
      error: null
    };
    console.log('File uploaded successfully:', uploadedFile);
  }

  onUploadError(error: string): void {
    this.state = {
      ...this.state,
      error
    };
    console.error('Upload error:', error);
  }

  onRemovePhoto(): void {
    if (this.state.uploadedFile) {
      // Освобождаем URL для предотвращения утечек памяти
      URL.revokeObjectURL(this.state.uploadedFile.previewUrl);
    }
    
    this.state = {
      uploadedFile: null,
      isAnalyzing: false,
      analysisResult: null,
      error: null
    };
  }

  onReplacePhoto(): void {
    // Сбрасываем состояние и позволяем загрузить новое фото
    this.onRemovePhoto();
  }

  onStartAnalysis(): void {
    if (!this.state.uploadedFile || this.state.isAnalyzing) {
      return;
    }

    this.state = {
      ...this.state,
      isAnalyzing: true,
      analysisResult: null,
      error: null
    };

    // Запускаем анализ
    if (this.state.uploadedFile) {
      this.analysisService.analyzeImage(this.state.uploadedFile.previewUrl).subscribe({
        next: (result: AnalysisResult) => {
          this.state = {
            ...this.state,
            isAnalyzing: false,
            analysisResult: result
          };
          console.log('Analysis completed:', result);
        },
        error: (error: Error) => {
          this.state = {
            ...this.state,
            isAnalyzing: false,
            error: 'Ошибка при анализе изображения. Попробуйте еще раз.'
          };
          console.error('Analysis error:', error);
        }
      });
    }
  }

  onReset(): void {
    this.onRemovePhoto();
  }

  clearError(): void {
    this.state = {
      ...this.state,
      error: null
    };
  }

  hasUploadedFile(): boolean {
    return this.state.uploadedFile !== null;
  }

  canStartAnalysis(): boolean {
    return this.hasUploadedFile() && !this.state.isAnalyzing;
  }
}