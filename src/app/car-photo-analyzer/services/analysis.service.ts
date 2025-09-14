import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

// Интерфейсы для API ответа
export interface ApiDetection {
  class: 'scratch' | 'dent' | 'rust' | 'crack';
  class_id: number;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
}

export interface ApiResponse {
  image_path: string;
  car_condition: 'intact' | 'damaged';
  has_damages: boolean;
  total_damages: number;
  damage_stats: {
    scratch: number;
    dent: number;
    rust: number;
    crack: number;
  };
  detections: ApiDetection[];
  filename: string;
  file_size: number;
  conf_threshold: number;
  visualization?: string; // base64 изображение
}

// Интерфейсы для фронтенда (адаптированные)
export interface AnalysisResult {
  carCondition: 'intact' | 'damaged';
  totalDamages: number;
  damageStats: {
    scratch: number;
    dent: number;
    rust: number;
    crack: number;
  };
  detections: Detection[];
  timestamp: Date;
  imageUrl: string;
  visualization?: string;
  confidence: number;
}

export interface Detection {
  type: 'scratch' | 'dent' | 'rust' | 'crack';
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  displayText: string;
}

// Устаревшие интерфейсы для обратной совместимости
export interface CleanlinessResult {
  status: 'clean' | 'dirty' | 'slightly-dirty' | 'very-dirty';
  confidence: number;
  displayText: string;
}

export interface IntegrityResult {
  status: 'intact' | 'damaged';
  confidence: number;
  displayText: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private readonly apiUrl = 'http://localhost:8000';
  private readonly minProcessingTime = 2000; // 2 секунды
  private readonly maxProcessingTime = 3000; // 3 секунды

  constructor(private http: HttpClient) {}

  /**
   * Анализирует изображение (автоматически выбирает API или mock)
   * @param file - Файл изображения
   * @returns Observable<AnalysisResult> с результатами анализа
   */
  analyzeImage(file: File): Observable<AnalysisResult> {
    // Сначала пробуем API, при ошибке переключаемся на mock
    return this.analyzeImageFile(file);
  }

  /**
   * Анализирует изображение через API бэкенда
   * @param file - Файл изображения
   * @returns Observable<AnalysisResult> с результатами анализа
   */
  analyzeImageFile(file: File): Observable<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conf_threshold', '0.25');
    formData.append('include_visualization', 'true');

    return this.http.post<ApiResponse>(`${this.apiUrl}/detect`, formData).pipe(
      map(response => this.mapApiResponseToAnalysisResult(response, URL.createObjectURL(file))),
      catchError(error => {
        console.error('API Error:', error);
        // Fallback к mock данным при ошибке API
        return this.analyzeImageMock(URL.createObjectURL(file));
      })
    );
  }

  /**
   * Анализирует изображение и возвращает mock результаты (fallback)
   * @param imageData - Base64 данные изображения или URL
   * @returns Observable<AnalysisResult> с результатами анализа
   */
  analyzeImageMock(imageData: string): Observable<AnalysisResult> {
    const processingTime = this.getRandomProcessingTime();
    
    return of(this.generateMockResult(imageData)).pipe(
      delay(processingTime)
    );
  }

  /**
   * Проверяет доступность API
   * @returns Observable<boolean>
   */
  checkApiHealth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Преобразует ответ API в формат фронтенда
   */
  private mapApiResponseToAnalysisResult(response: ApiResponse, imageUrl: string): AnalysisResult {
    const avgConfidence = response.detections.length > 0 
      ? response.detections.reduce((sum, det) => sum + det.confidence, 0) / response.detections.length
      : 0;

    return {
      carCondition: response.car_condition,
      totalDamages: response.total_damages,
      damageStats: response.damage_stats,
      detections: response.detections.map(det => ({
        type: det.class,
        confidence: det.confidence,
        bbox: det.bbox,
        displayText: this.getDamageDisplayText(det.class)
      })),
      timestamp: new Date(),
      imageUrl,
      visualization: response.visualization,
      confidence: avgConfidence
    };
  }

  /**
   * Возвращает отображаемый текст для типа повреждения
   */
  private getDamageDisplayText(damageType: string): string {
    const damageMap: Record<string, string> = {
      'scratch': 'Царапина',
      'dent': 'Вмятина',
      'rust': 'Ржавчина',
      'crack': 'Трещина'
    };
    return damageMap[damageType] || damageType;
  }

  /**
   * Генерирует случайное время обработки
   * @returns Время в миллисекундах
   */
  private getRandomProcessingTime(): number {
    return Math.floor(
      Math.random() * (this.maxProcessingTime - this.minProcessingTime + 1)
    ) + this.minProcessingTime;
  }

  /**
   * Генерирует mock результаты анализа
   * @param imageUrl - URL изображения
   * @returns AnalysisResult с случайными результатами
   */
  private generateMockResult(imageUrl: string): AnalysisResult {
    const hasDamages = Math.random() > 0.5;
    const totalDamages = hasDamages ? Math.floor(Math.random() * 3) + 1 : 0;
    
    const mockDetections: Detection[] = [];
    if (hasDamages) {
      const damageTypes: Array<'scratch' | 'dent' | 'rust' | 'crack'> = ['scratch', 'dent', 'rust', 'crack'];
      for (let i = 0; i < totalDamages; i++) {
        const damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)];
        mockDetections.push({
          type: damageType,
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          bbox: {
            x1: Math.floor(Math.random() * 300),
            y1: Math.floor(Math.random() * 300),
            x2: Math.floor(Math.random() * 100) + 350,
            y2: Math.floor(Math.random() * 100) + 350,
            width: 100,
            height: 100
          },
          displayText: this.getDamageDisplayText(damageType)
        });
      }
    }

    return {
      carCondition: hasDamages ? 'damaged' : 'intact',
      totalDamages,
      damageStats: {
        scratch: mockDetections.filter(d => d.type === 'scratch').length,
        dent: mockDetections.filter(d => d.type === 'dent').length,
        rust: mockDetections.filter(d => d.type === 'rust').length,
        crack: mockDetections.filter(d => d.type === 'crack').length
      },
      detections: mockDetections,
      timestamp: new Date(),
      imageUrl,
      confidence: mockDetections.length > 0 
        ? mockDetections.reduce((sum, det) => sum + det.confidence, 0) / mockDetections.length 
        : 0
    };
  }

  /**
   * Возвращает иконку для типа повреждения
   */
  getDamageIcon(damageType: string): string {
    const iconMap: Record<string, string> = {
      'scratch': '🔍',
      'dent': '🔨',
      'rust': '🦠',
      'crack': '💥'
    };
    return iconMap[damageType] || '⚠️';
  }

  /**
   * Возвращает цвет для типа повреждения
   */
  getDamageColor(damageType: string): string {
    const colorMap: Record<string, string> = {
      'scratch': '#ff6b6b',
      'dent': '#4ecdc4',
      'rust': '#ffa726',
      'crack': '#ab47bc'
    };
    return colorMap[damageType] || '#757575';
  }

  /**
   * Проверяет, является ли результат положительным (без повреждений)
   */
  isPositiveResult(result: AnalysisResult): boolean {
    return result.carCondition === 'intact' && result.totalDamages === 0;
  }

  /**
   * Возвращает CSS класс для результата
   */
  getResultCssClass(carCondition: string): string {
    return carCondition === 'intact' ? 'success' : 'error';
  }

  /**
   * Возвращает общий статус автомобиля на русском
   */
  getCarConditionText(carCondition: string): string {
    return carCondition === 'intact' ? 'Целый' : 'Поврежден';
  }

  /**
   * Возвращает иконку для состояния автомобиля
   */
  getCarConditionIcon(carCondition: string): string {
    return carCondition === 'intact' ? '✅' : '❌';
  }
}

