import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AnalysisResult {
  cleanliness: CleanlinessResult;
  integrity: IntegrityResult;
  timestamp: Date;
  imageUrl: string;
}

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
  private readonly minProcessingTime = 2000; // 2 секунды
  private readonly maxProcessingTime = 3000; // 3 секунды

  /**
   * Анализирует изображение и возвращает mock результаты
   * @param imageData - Base64 данные изображения или URL
   * @returns Observable<AnalysisResult> с результатами анализа
   */
  analyzeImage(imageData: string): Observable<AnalysisResult> {
    // Генерируем случайное время обработки от 2 до 3 секунд
    const processingTime = this.getRandomProcessingTime();
    
    return of(this.generateMockResult(imageData)).pipe(
      delay(processingTime)
    );
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
    const cleanliness = this.generateCleanlinessResult();
    const integrity = this.generateIntegrityResult();

    return {
      cleanliness,
      integrity,
      timestamp: new Date(),
      imageUrl
    };
  }

  /**
   * Генерирует результат анализа чистоты
   * @returns CleanlinessResult
   */
  private generateCleanlinessResult(): CleanlinessResult {
    const statuses: CleanlinessResult['status'][] = ['clean', 'dirty', 'slightly-dirty', 'very-dirty'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%

    return {
      status,
      confidence,
      displayText: this.getCleanlinessDisplayText(status)
    };
  }

  /**
   * Генерирует результат анализа целостности
   * @returns IntegrityResult
   */
  private generateIntegrityResult(): IntegrityResult {
    const statuses: IntegrityResult['status'][] = ['intact', 'damaged'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%

    return {
      status,
      confidence,
      displayText: this.getIntegrityDisplayText(status)
    };
  }

  /**
   * Возвращает отображаемый текст для статуса чистоты
   * @param status - Статус чистоты
   * @returns Отображаемый текст
   */
  private getCleanlinessDisplayText(status: CleanlinessResult['status']): string {
    const statusMap: Record<CleanlinessResult['status'], string> = {
      'clean': 'Чистый',
      'dirty': 'Грязный',
      'slightly-dirty': 'Слегка грязный',
      'very-dirty': 'Сильно грязный'
    };
    return statusMap[status];
  }

  /**
   * Возвращает отображаемый текст для статуса целостности
   * @param status - Статус целостности
   * @returns Отображаемый текст
   */
  private getIntegrityDisplayText(status: IntegrityResult['status']): string {
    const statusMap: Record<IntegrityResult['status'], string> = {
      'intact': 'Целый',
      'damaged': 'Битый'
    };
    return statusMap[status];
  }

  /**
   * Возвращает иконку для статуса чистоты
   * @param status - Статус чистоты
   * @returns Эмодзи иконка
   */
  getCleanlinessIcon(status: CleanlinessResult['status']): string {
    const iconMap: Record<CleanlinessResult['status'], string> = {
      'clean': '🚘',
      'dirty': '🚗',
      'slightly-dirty': '🚙',
      'very-dirty': '🚚'
    };
    return iconMap[status];
  }

  /**
   * Возвращает иконку для статуса целостности
   * @param status - Статус целостности
   * @returns Эмодзи иконка
   */
  getIntegrityIcon(status: IntegrityResult['status']): string {
    const iconMap: Record<IntegrityResult['status'], string> = {
      'intact': '🛠',
      'damaged': '🔧'
    };
    return iconMap[status];
  }

  /**
   * Проверяет, является ли результат положительным (хорошим)
   * @param result - Результат анализа
   * @returns true если результат положительный
   */
  isPositiveResult(result: AnalysisResult): boolean {
    return result.cleanliness.status === 'clean' && result.integrity.status === 'intact';
  }

  /**
   * Возвращает CSS класс для результата
   * @param status - Статус результата
   * @param isCleanliness - Является ли это результатом чистоты
   * @returns CSS класс
   */
  getResultCssClass(status: string, isCleanliness: boolean = true): string {
    if (isCleanliness) {
      return status === 'clean' ? 'success' : 'error';
    } else {
      return status === 'intact' ? 'success' : 'error';
    }
  }
}
