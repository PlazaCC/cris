FROM node:22-alpine AS build

WORKDIR /opt

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY clients/web/package.json ./clients/web/

RUN corepack enable \
  && yarn install --immutable

COPY clients/web ./clients/web

WORKDIR /opt/clients/web

ARG VITE_STRAPI_API_URL
ARG VITE_STRAPI_API_TOKEN
ARG VITE_DEV_MODE=false

ENV VITE_STRAPI_API_URL=$VITE_STRAPI_API_URL
ENV VITE_STRAPI_API_TOKEN=$VITE_STRAPI_API_TOKEN
ENV VITE_DEV_MODE=$VITE_DEV_MODE

RUN yarn build

FROM nginx:1.27-alpine

COPY clients/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /opt/clients/web/dist /usr/share/nginx/html

EXPOSE 80
