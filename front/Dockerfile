FROM node:20-alpine AS builder

WORKDIR /app
COPY front/package*.json ./
RUN npm ci
COPY front .
RUN npm run build

FROM nginx:1.27-alpine
COPY front/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
