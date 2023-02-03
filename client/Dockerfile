FROM node:16.15

WORKDIR /app

COPY . .

RUN npm install 
RUN npm install --global serve 
RUN npm run build

EXPOSE 3003

CMD ["serve", "-s", "build"]
