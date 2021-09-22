FROM node:14.15.0-alpine

WORKDIR /app

ADD . .

EXPOSE 80

CMD node server.js
