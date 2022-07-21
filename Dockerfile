FROM node:16.15-alpine

RUN mkdir /opt/app

WORKDIR /opt/app

ARG app_name

RUN if [[ $app_name == 'image-consumer' ]] ; \
  then apk add binutils make build-base vips-dev ; \
  fi

ADD ./package.json ./yarn.lock /opt/app/

RUN yarn

ADD ./ /opt/app

RUN yarn build

ENV APP_NAME $app_name

CMD node /opt/app/dist/$APP_NAME.js
