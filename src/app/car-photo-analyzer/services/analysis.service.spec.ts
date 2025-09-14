import { TestBed } from '@angular/core/testing';
import { AnalysisService, AnalysisResult } from './analysis.service';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate mock analysis result', (done) => {
    const mockImageData = 'data:image/jpeg;base64,test';
    
    service.analyzeImage(mockImageData).subscribe({
      next: (result: AnalysisResult) => {
        expect(result).toBeDefined();
        expect(result.cleanliness).toBeDefined();
        expect(result.integrity).toBeDefined();
        expect(result.timestamp).toBeDefined();
        expect(result.imageUrl).toBe(mockImageData);
        
        // Проверяем, что статусы валидны
        expect(['clean', 'dirty', 'slightly-dirty', 'very-dirty']).toContain(result.cleanliness.status);
        expect(['intact', 'damaged']).toContain(result.integrity.status);
        
        // Проверяем уверенность
        expect(result.cleanliness.confidence).toBeGreaterThanOrEqual(70);
        expect(result.cleanliness.confidence).toBeLessThanOrEqual(100);
        expect(result.integrity.confidence).toBeGreaterThanOrEqual(70);
        expect(result.integrity.confidence).toBeLessThanOrEqual(100);
        
        done();
      },
      error: (error) => {
        fail('Should not error: ' + error);
      }
    });
  });

  it('should return correct display text for cleanliness status', () => {
    expect(service['getCleanlinessDisplayText']('clean')).toBe('Чистый');
    expect(service['getCleanlinessDisplayText']('dirty')).toBe('Грязный');
    expect(service['getCleanlinessDisplayText']('slightly-dirty')).toBe('Слегка грязный');
    expect(service['getCleanlinessDisplayText']('very-dirty')).toBe('Сильно грязный');
  });

  it('should return correct display text for integrity status', () => {
    expect(service['getIntegrityDisplayText']('intact')).toBe('Целый');
    expect(service['getIntegrityDisplayText']('damaged')).toBe('Битый');
  });

  it('should return correct icons for cleanliness status', () => {
    expect(service.getCleanlinessIcon('clean')).toBe('🚘');
    expect(service.getCleanlinessIcon('dirty')).toBe('🚗');
    expect(service.getCleanlinessIcon('slightly-dirty')).toBe('🚙');
    expect(service.getCleanlinessIcon('very-dirty')).toBe('🚚');
  });

  it('should return correct icons for integrity status', () => {
    expect(service.getIntegrityIcon('intact')).toBe('🛠');
    expect(service.getIntegrityIcon('damaged')).toBe('🔧');
  });

  it('should correctly identify positive results', () => {
    const positiveResult: AnalysisResult = {
      cleanliness: { status: 'clean', confidence: 95, displayText: 'Чистый' },
      integrity: { status: 'intact', confidence: 90, displayText: 'Целый' },
      timestamp: new Date(),
      imageUrl: 'test'
    };

    const negativeResult: AnalysisResult = {
      cleanliness: { status: 'dirty', confidence: 85, displayText: 'Грязный' },
      integrity: { status: 'damaged', confidence: 80, displayText: 'Битый' },
      timestamp: new Date(),
      imageUrl: 'test'
    };

    expect(service.isPositiveResult(positiveResult)).toBe(true);
    expect(service.isPositiveResult(negativeResult)).toBe(false);
  });

  it('should return correct CSS classes for results', () => {
    expect(service.getResultCssClass('clean', true)).toBe('success');
    expect(service.getResultCssClass('dirty', true)).toBe('error');
    expect(service.getResultCssClass('intact', false)).toBe('success');
    expect(service.getResultCssClass('damaged', false)).toBe('error');
  });

  it('should generate random processing time within range', () => {
    const times: number[] = [];
    
    // Генерируем несколько раз, чтобы проверить случайность
    for (let i = 0; i < 10; i++) {
      const time = service['getRandomProcessingTime']();
      times.push(time);
      expect(time).toBeGreaterThanOrEqual(2000);
      expect(time).toBeLessThanOrEqual(3000);
    }
    
    // Проверяем, что времена действительно разные (случайные)
    const uniqueTimes = new Set(times);
    expect(uniqueTimes.size).toBeGreaterThan(1);
  });
});

