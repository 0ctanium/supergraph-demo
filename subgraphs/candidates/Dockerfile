from node:16-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY candidates.js .
COPY candidates.graphql .

CMD [ "node", "candidates.js" ]
