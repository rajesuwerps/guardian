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

WORKDIR /usr/mrv-sender
COPY ./mrv-sender/package*.json ./
COPY ./mrv-sender/tsconfig.json ./
RUN npm install
ADD ./mrv-sender/src ./src/.
ADD ./mrv-sender/public ./public/.
RUN npm run build

CMD npm start
