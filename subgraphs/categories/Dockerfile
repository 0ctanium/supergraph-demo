from node:16-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY categories.js .
COPY categories.graphql .

CMD [ "node", "categories.js" ]
