import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult, AnalysisService } from '../../services/analysis.service';

@Component({
  selector: 'app-results-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-display.component.html',
  styleUrls: ['./results-display.component.css']
})
export class ResultsDisplayComponent {
  @Input() result: AnalysisResult | null = null;
  @Input() isAnalyzing: boolean = false;
  @Output() reset = new EventEmitter<void>();

  constructor(public analysisService: AnalysisService) {}

  /**
   * Обработчик клика по кнопке сброса
   */
  onReset(): void {
    this.reset.emit();
  }

  /**
   * Проверяет, есть ли результаты для отображения
   */
  hasResults(): boolean {
    return this.result !== null && !this.isAnalyzing;
  }

  /**
   * Получает CSS класс для результата чистоты
   */
  getCleanlinessClass(): string {
    if (!this.result) return '';
    return this.analysisService.getResultCssClass(this.result.cleanliness.status, true);
  }

  /**
   * Получает CSS класс для результата целостности
   */
  getIntegrityClass(): string {
    if (!this.result) return '';
    return this.analysisService.getResultCssClass(this.result.integrity.status, false);
  }

  /**
   * Получает иконку для результата чистоты
   */
  getCleanlinessIcon(): string {
    if (!this.result) return '';
    return this.analysisService.getCleanlinessIcon(this.result.cleanliness.status);
  }

  /**
   * Получает иконку для результата целостности
   */
  getIntegrityIcon(): string {
    if (!this.result) return '';
    return this.analysisService.getIntegrityIcon(this.result.integrity.status);
  }

  /**
   * Форматирует процент уверенности
   */
  formatConfidence(confidence: number): string {
    return `${confidence}%`;
  }

  /**
   * Форматирует время анализа
   */
  formatTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  }
}
