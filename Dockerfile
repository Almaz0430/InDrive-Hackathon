# Этап 1: Сборка Angular-приложения
FROM node:20-alpine AS build

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходный код приложения
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Этап 2: Настройка веб-сервера Nginx для раздачи статических файлов
FROM nginx:stable-alpine AS final

# Копируем собранные файлы из этапа сборки
COPY --from=build /app/dist/InDrive-Hackathon/browser /usr/share/nginx/html

# Устанавливаем gettext для использования envsubst, который подставит переменную окружения в конфиг
RUN apk add --no-cache gettext

# Копируем шаблон конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Запускаем Nginx, предварительно подставив нужный порт в конфигурацию.
# Railway автоматически предоставит переменную $PORT.
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
