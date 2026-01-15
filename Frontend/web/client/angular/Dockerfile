FROM node:20-alpine3.19

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

ENV TZ=Africa/Lagos
EXPOSE 3000

CMD ["npm", "start"]
