import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Loader2, AlertTriangle, X, Wifi, WifiOff } from 'lucide-angular';
import { PhotoUploadComponent } from './components/photo-upload/photo-upload.component';
import { PhotoPreviewComponent } from './components/photo-preview/photo-preview.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { UploadedFile } from './services/photo-upload.service';
import { AnalysisResult, AnalysisService } from './services/analysis.service';
import { ApiHealthService, ApiHealthStatus } from './services/api-health.service';
import { Subscription } from 'rxjs';

interface CarPhotoAnalyzerState {
  uploadedFile: UploadedFile | null;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;
}

@Component({
  selector: 'app-car-photo-analyzer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PhotoUploadComponent, PhotoPreviewComponent, ResultsDisplayComponent],
  templateUrl: './car-photo-analyzer.component.html',
  styleUrl: './car-photo-analyzer.component.css'
})
export class CarPhotoAnalyzerComponent implements OnInit, OnDestroy {
  state: CarPhotoAnalyzerState = {
    uploadedFile: null,
    isAnalyzing: false,
    analysisResult: null,
    error: null
  };

  apiHealthStatus: ApiHealthStatus | null = null;
  private healthSubscription?: Subscription;

  // Иконки
  readonly SearchIcon = Search;
  readonly LoaderIcon = Loader2;
  readonly AlertIcon = AlertTriangle;
  readonly CloseIcon = X;
  readonly WifiIcon = Wifi;
  readonly WifiOffIcon = WifiOff;

  constructor(
    private analysisService: AnalysisService,
    private apiHealthService: ApiHealthService
  ) {}

  ngOnInit(): void {
    // Подписываемся на статус API
    this.healthSubscription = this.apiHealthService.getHealthStatus().subscribe(
      status => {
        this.apiHealthStatus = status;
      }
    );

    // Проверяем статус API при загрузке
    this.apiHealthService.checkHealth().subscribe();
  }

  ngOnDestroy(): void {
    if (this.healthSubscription) {
      this.healthSubscription.unsubscribe();
    }
  }

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

    // Запускаем анализ (API или mock)
    if (this.state.uploadedFile) {
      this.analysisService.analyzeImage(this.state.uploadedFile.file).subscribe({
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
            error: 'Ошибка при анализе изображения. Проверьте подключение к серверу.'
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

  /**
   * Проверяет статус API
   */
  refreshApiStatus(): void {
    this.apiHealthService.checkHealth().subscribe();
  }

  /**
   * Получает текст статуса API
   */
  getApiStatusText(): string {
    if (!this.apiHealthStatus) return 'Проверка...';
    
    if (this.apiHealthStatus.isOnline) {
      return `API онлайн (${this.apiHealthStatus.device || 'CPU'})`;
    } else {
      return 'API недоступен (используются mock данные)';
    }
  }

  /**
   * Получает CSS класс для статуса API
   */
  getApiStatusClass(): string {
    if (!this.apiHealthStatus) return 'checking';
    return this.apiHealthStatus.isOnline ? 'online' : 'offline';
  }
}