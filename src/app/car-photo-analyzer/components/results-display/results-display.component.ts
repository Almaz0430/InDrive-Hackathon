import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2, RotateCcw, CheckCircle, AlertTriangle, Sparkles, Shield, Eye } from 'lucide-angular';
import { AnalysisResult, AnalysisService, Detection } from '../../services/analysis.service';

@Component({
  selector: 'app-results-display',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './results-display.component.html',
  styleUrls: ['./results-display.component.css']
})
export class ResultsDisplayComponent {
  @Input() result: AnalysisResult | null = null;
  @Input() isAnalyzing: boolean = false;
  @Output() reset = new EventEmitter<void>();

  // Иконки
  readonly LoaderIcon = Loader2;
  readonly ResetIcon = RotateCcw;
  readonly CheckIcon = CheckCircle;
  readonly AlertIcon = AlertTriangle;
  readonly SparklesIcon = Sparkles;
  readonly ShieldIcon = Shield;
  readonly EyeIcon = Eye;

  showVisualization = false;

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
   * Получает CSS класс для состояния автомобиля
   */
  getCarConditionClass(): string {
    if (!this.result) return '';
    return this.analysisService.getResultCssClass(this.result.carCondition);
  }

  /**
   * Получает текст состояния автомобиля
   */
  getCarConditionText(): string {
    if (!this.result) return '';
    return this.analysisService.getCarConditionText(this.result.carCondition);
  }

  /**
   * Получает иконку состояния автомобиля
   */
  getCarConditionIcon(): string {
    if (!this.result) return '';
    return this.analysisService.getCarConditionIcon(this.result.carCondition);
  }

  /**
   * Переключает отображение визуализации
   */
  toggleVisualization(): void {
    this.showVisualization = !this.showVisualization;
  }

  /**
   * Проверяет, есть ли визуализация
   */
  hasVisualization(): boolean {
    return !!(this.result?.visualization);
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

