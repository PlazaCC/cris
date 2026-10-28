FROM node:22-alpine AS build

WORKDIR /opt

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY clients/web/package.json ./clients/web/

RUN corepack enable
RUN yarn install

COPY clients/web ./clients/web

WORKDIR /opt/clients/web

RUN yarn build

FROM node:22-alpine

WORKDIR /opt/app

COPY --from=build /opt/clients/web/.output ./.output

# DATABASE_URL, BLOB_READ_WRITE_TOKEN, BETTER_AUTH_SECRET e BETTER_AUTH_URL
# entram em runtime (docker compose / plataforma), nunca no build
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
