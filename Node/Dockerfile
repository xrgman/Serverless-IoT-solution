FROM arm32v6/node:alpine

WORKDIR /app

ADD package.json /app
RUN npm install

ADD server.js dataController.js deviceController.js /app/

EXPOSE 3000

CMD [ "npm", "start"]
