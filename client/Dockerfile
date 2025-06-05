FROM node:20.15-alpine
WORKDIR /app
COPY ./app .
RUN npm install
EXPOSE 3001
CMD [ "npm", "run", "dev" ]