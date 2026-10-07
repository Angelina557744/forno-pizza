FROM node:18-slim

# Устанавливаем инструменты для сборки better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем только production-зависимости
RUN npm ci --only=production

# Копируем весь остальной код
COPY . .

# Создаем папку для базы данных (на случай, если её нет)
RUN mkdir -p /app/data

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD [ "node", "server.js" ]