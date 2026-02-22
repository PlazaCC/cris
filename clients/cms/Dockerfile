FROM node:22-alpine AS base

RUN apk add --no-cache \
  bash \
  build-base \
  gcc \
  autoconf \
  automake \
  zlib-dev \
  libpng-dev \
  nasm \
  vips-dev \
  git

WORKDIR /opt

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY clients/cms/package.json ./clients/cms/

RUN corepack enable \
  && yarn install --immutable

COPY clients/cms ./clients/cms

WORKDIR /opt/clients/cms

FROM base AS build
RUN yarn build

FROM base AS prod
ENV NODE_ENV=production
WORKDIR /opt/clients/cms
COPY --from=build /opt/clients/cms /opt/clients/cms
EXPOSE 1337
CMD ["yarn", "start"]
