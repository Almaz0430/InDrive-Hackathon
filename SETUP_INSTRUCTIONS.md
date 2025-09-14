# Инструкции по настройке и запуску

## Структура проекта

```
├── backend/                 # Бэкенд API (Python + FastAPI + YOLOv8)
├── src/                    # Фронтенд (Angular)
├── SETUP_INSTRUCTIONS.md   # Эти инструкции
└── README.md
```

## Шаг 1: Настройка бэкенда

### 1.1 Установка Python зависимостей

```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Проверка установки

```bash
python -c "import torch; print('PyTorch:', torch.__version__)"
python -c "import ultralytics; print('Ultralytics:', ultralytics.__version__)"
```

### 1.3 Запуск API сервера

```bash
# Из папки backend
python src/api.py
```

Или через uvicorn:

```bash
uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

API будет доступен по адресу: http://localhost:8000

### 1.4 Проверка работы API

Откройте в браузере:
- http://localhost:8000 - главная страница API
- http://localhost:8000/docs - Swagger документация
- http://localhost:8000/health - проверка состояния

Или запустите тест:

```bash
python test_api.py
```

## Шаг 2: Настройка фронтенда

### 2.1 Установка зависимостей

```bash
# Из корневой папки проекта
npm install
```

### 2.2 Запуск фронтенда

```bash
npm start
```

Фронтенд будет доступен по адресу: http://localhost:4200

## Шаг 3: Тестирование интеграции

1. Убедитесь, что бэкенд запущен на http://localhost:8000
2. Убедитесь, что фронтенд запущен на http://localhost:4200
3. Откройте фронтенд в браузере
4. Загрузите фото автомобиля
5. Нажмите "Начать анализ"

## API Endpoints

### GET /health
Проверка состояния сервиса

### GET /model_info
Информация о модели

### POST /detect
Детекция повреждений на изображении

Параметры:
- `file` (File): Изображение автомобиля
- `conf_threshold` (float): Порог уверенности (по умолчанию: 0.25)
- `include_visualization` (bool): Включить визуализацию (по умолчанию: true)

### POST /visualize
Получение изображения с визуализацией детекций

## Структура ответа API

```json
{
  "image_path": "temp_image.jpg",
  "car_condition": "damaged",
  "has_damages": true,
  "total_damages": 2,
  "damage_stats": {
    "scratch": 1,
    "dent": 1,
    "rust": 0,
    "crack": 0
  },
  "detections": [
    {
      "class": "scratch",
      "class_id": 0,
      "confidence": 0.85,
      "bbox": {
        "x1": 100,
        "y1": 150,
        "x2": 200,
        "y2": 180,
        "width": 100,
        "height": 30
      }
    }
  ],
  "filename": "car.jpg",
  "file_size": 245760,
  "conf_threshold": 0.25,
  "visualization": "base64_encoded_image"
}
```

## Возможные проблемы и решения

### Проблема: Ошибка импорта torch
**Решение:** Установите PyTorch согласно официальной документации для вашей системы

### Проблема: API недоступен
**Решение:** 
1. Проверьте, что сервер запущен на порту 8000
2. Проверьте файрвол
3. Убедитесь, что порт не занят другим процессом

### Проблема: CORS ошибки
**Решение:** API уже настроен для работы с любыми доменами, но убедитесь, что фронтенд обращается к правильному URL

### Проблема: Модель не найдена
**Решение:** 
1. Убедитесь, что файлы моделей (yolo11n.pt, yolov8n.pt, yolov8s.pt) находятся в папке backend/
2. При первом запуске модель может загружаться автоматически

## Режим разработки

Для разработки рекомендуется:

1. Запустить бэкенд с автоперезагрузкой:
```bash
uvicorn src.api:app --reload --host 0.0.0.0 --port 8000
```

2. Запустить фронтенд в режиме разработки:
```bash
npm start
```

## Fallback режим

Если бэкенд недоступен, фронтенд автоматически переключится на mock данные для демонстрации функциональности.

## Дополнительные команды

### Сборка фронтенда для продакшена
```bash
npm run build
```

### Запуск тестов фронтенда
```bash
npm test
```

### Проверка API через curl
```bash
curl -X POST "http://localhost:8000/detect" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@path/to/car/image.jpg" \
     -F "conf_threshold=0.25"
```