FROM node:16
ENV PLATFORM="docker"
#ENV NODE_ENV="production"

WORKDIR /usr/interfaces
COPY ./interfaces/package*.json ./
COPY ./interfaces/tsconfig.json ./
RUN npm install
ADD ./interfaces/src ./src/.
RUN npm run build

WORKDIR /usr/common
COPY ./common/package*.json ./
COPY ./common/tsconfig.json ./
RUN npm install
ADD ./common/src ./src/.
RUN npm run build

WORKDIR /usr/logger-service
COPY ./logger-service/package*.json ./
COPY ./logger-service/tsconfig.json ./
COPY ./logger-service/.env.docker ./.env
RUN npm install --force
ADD ./logger-service/src ./src/.
RUN npm run build

CMD npm start
