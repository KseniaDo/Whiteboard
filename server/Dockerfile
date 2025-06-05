FROM node:20.15-alpine
WORKDIR /app
COPY ./app .
RUN npm install
COPY ./app/index.js ./
EXPOSE 3000
CMD [ "npm", "start" ]