FROM node:18-alpine3.18

ENV CI=true
ENV WDS_SOCKET_PORT=0

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . . 

ENV TZ=Africa/Lagos
EXPOSE 3000

CMD ["npm", "start"]
