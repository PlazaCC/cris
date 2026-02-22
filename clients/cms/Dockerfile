FROM node:22-alpine

# Dependências necessárias para o Strapi (sharp/libvips)
RUN apk add --no-cache \
  build-base \
  gcc \
  autoconf \
  automake \
  zlib-dev \
  libpng-dev \
  nasm \
  bash \
  vips-dev \
  git

ENV NODE_ENV=development

# ==============================
# 1️⃣ Instala dependências do monorepo
# ==============================

WORKDIR /opt

# Copia root (workspaces + lockfile)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copia apenas o package.json do CMS (melhor cache)
COPY clients/cms/package.json ./clients/cms/

# Instala dependências respeitando workspaces
RUN corepack enable
RUN yarn install

# ==============================
# 2️⃣ Copia código da aplicação
# ==============================

COPY clients/cms ./clients/cms

WORKDIR /opt/clients/cms

# Build do Strapi
RUN yarn build

EXPOSE 1337

CMD ["yarn", "develop"]