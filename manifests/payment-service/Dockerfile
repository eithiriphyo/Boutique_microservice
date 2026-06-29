FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3003
CMD ["node", "src/index.js"]