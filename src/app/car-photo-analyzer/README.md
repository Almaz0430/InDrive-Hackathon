# Анализатор фотографий автомобилей

Веб-приложение для анализа состояния автомобилей по фотографиям с использованием Angular и современных веб-технологий.

## 🚀 Функциональность

- **Загрузка фотографий** с поддержкой drag-and-drop
- **Предпросмотр изображений** с детальной информацией о файле
- **Имитация анализа** состояния автомобиля (чистота и целостность)
- **Цветовое кодирование результатов** для быстрого понимания
- **Адаптивный дизайн** в стиле dario.io
- **Управление состоянием** с возможностью сброса и замены фото

## 📋 Требования

- Node.js 18+ 
- Angular 17+
- Современный браузер с поддержкой ES2020+

## 🛠 Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите приложение в режиме разработки:
```bash
npm start
```

3. Откройте браузер и перейдите по адресу `http://localhost:4200`

## 🏗 Архитектура

### Компоненты

- **CarPhotoAnalyzerComponent** - главный контейнер приложения
- **PhotoUploadComponent** - загрузка файлов с drag-and-drop
- **PhotoPreviewComponent** - предпросмотр загруженных изображений
- **ResultsDisplayComponent** - отображение результатов анализа

### Сервисы

- **PhotoUploadService** - валидация и обработка файлов
- **AnalysisService** - имитация анализа изображений

### Модели данных

```typescript
interface AnalysisResult {
  cleanliness: CleanlinessResult;
  integrity: IntegrityResult;
  timestamp: Date;
  imageUrl: string;
}

interface CleanlinessResult {
  status: 'clean' | 'dirty' | 'slightly-dirty' | 'very-dirty';
  confidence: number;
  displayText: string;
}

interface IntegrityResult {
  status: 'intact' | 'damaged';
  confidence: number;
  displayText: string;
}
```

## 🎨 Дизайн

Приложение использует минималистичный дизайн в стиле dario.io:

- **Цветовая схема**: Белый фон с зеленым акцентом (#00b894)
- **Типографика**: Inter font с крупными жирными заголовками
- **Анимации**: Плавные переходы и микроинтеракции
- **Адаптивность**: Полная поддержка мобильных устройств

## 📱 Поддерживаемые форматы

- **Изображения**: JPG, JPEG, PNG
- **Максимальный размер**: 10MB
- **Рекомендуемое разрешение**: до 4096x4096px

## 🔧 Разработка

### Структура проекта

```
src/app/car-photo-analyzer/
├── components/
│   ├── photo-upload/
│   ├── photo-preview/
│   └── results-display/
├── services/
│   ├── photo-upload.service.ts
│   └── analysis.service.ts
├── car-photo-analyzer.component.ts
└── README.md
```

### Тестирование

Запуск тестов:
```bash
npm test
```

Запуск тестов с покрытием:
```bash
npm run test:coverage
```

### Сборка

Сборка для продакшена:
```bash
npm run build
```

## 🚀 Развертывание

1. Соберите проект:
```bash
npm run build
```

2. Файлы для развертывания находятся в папке `dist/`

3. Загрузите содержимое папки `dist/` на ваш веб-сервер

## 📄 Лицензия

Этот проект создан для хакатона InDrive и предназначен для демонстрационных целей.

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📞 Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории проекта.
