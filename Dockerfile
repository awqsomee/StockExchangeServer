FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
# Если вы создаете сборку для продакшн
# RUN npm ci --only=production

# копируем исходный код
COPY . .

EXPOSE 80
CMD [ "node", "index.js" ]