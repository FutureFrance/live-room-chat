FROM node:16.15

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
RUN npm install pm2 --global

EXPOSE 3003

CMD ["pm2-runtime","./dist/index.js"]
