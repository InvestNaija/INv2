# Stage 1: Build Angular application
FROM node:20-alpine3.19 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN npm install @angular/cli
RUN npm run build --prod

# Stage 2: Serve Angular application using nginx
FROM nginx:alpine
COPY --from=builder /app/dist/browser /usr/share/nginx/html
EXPOSE 80
ENV TZ=Africa/Lagos
CMD ["nginx", "-g", "daemon off;"]
