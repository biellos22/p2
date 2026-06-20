# Estágio 1: Build
FROM node:20-alpine as builder
WORKDIR /app
ARG VITE_API_URL=/api
ARG VITE_API_FLASK_URL=/api-flask
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_FLASK_URL=$VITE_API_FLASK_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Nginx
FROM nginxinc/nginx-unprivileged:alpine
# Copiar o build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html
# Configurar o Nginx para roteamento do React (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
