FROM node:alpine

WORKDIR /src/app

RUN npm install --quiet
RUN npm install -g nodemon

EXPOSE 8080

CMD ["nodemon", "-L", "app.js"]
