import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, catchError, tap } from 'rxjs/operators';

export interface ApiHealthStatus {
  isOnline: boolean;
  status: string;
  device?: string;
  damageClasses?: string[];
  lastChecked: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApiHealthService {
  private readonly apiUrl = environment.apiUrl;
  private healthStatus$ = new BehaviorSubject<ApiHealthStatus>({
    isOnline: false,
    status: 'unknown',
    lastChecked: new Date()
  });

  constructor(private http: HttpClient) {
    // Проверяем статус при инициализации
    this.checkHealth().subscribe();
  }

  /**
   * Получает текущий статус API
   */
  getHealthStatus(): Observable<ApiHealthStatus> {
    return this.healthStatus$.asObservable();
  }

  /**
   * Проверяет доступность API
   */
  checkHealth(): Observable<ApiHealthStatus> {
    return this.http.get<any>(`${this.apiUrl}/health`).pipe(
      map(response => ({
        isOnline: true,
        status: response.status || 'healthy',
        device: response.device,
        damageClasses: response.damage_classes,
        lastChecked: new Date()
      })),
      catchError(() => of({
        isOnline: false,
        status: 'offline',
        lastChecked: new Date()
      })),
      tap(status => this.healthStatus$.next(status))
    );
  }

  /**
   * Получает информацию о модели
   */
  getModelInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/model_info`).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Проверяет, доступен ли API
   */
  isApiOnline(): boolean {
    return this.healthStatus$.value.isOnline;
  }
}