from node:16-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY jobs.js .
COPY jobs.graphql .

CMD [ "node", "jobs.js" ]
