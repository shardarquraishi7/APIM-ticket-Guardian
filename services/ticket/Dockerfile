FROM node:22-bullseye AS base

ARG NPMRC

ARG ENV_FILE=.env.production
ENV HOME=/home/node
ENV APP_ROOT=$HOME/app
ENV NO_UPDATE_NOTIFIER=true
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
ENV NPM_CONFIG_SCRIPT_SHELL=/bin/bash
ENV NPM_CONFIG_DEPTH=0
ENV NODE_PATH=$NPM_CONFIG_PREFIX/lib/node_modules

WORKDIR $APP_ROOT

RUN adduser node root
RUN chgrp -R 0 $APP_ROOT && chmod -R g=u $APP_ROOT

FROM base AS dependencies
RUN echo "$NPMRC" >> $HOME/app/.npmrc
# USER node
COPY package.json package-lock.json $APP_ROOT/
RUN npm set progress=false
RUN npm ci

FROM dependencies AS builder
WORKDIR $APP_ROOT
COPY --from=dependencies $APP_ROOT/node_modules/ ./node_modules/
COPY . .
COPY $ENV_FILE .env.production

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM base AS runner
WORKDIR $APP_ROOT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder $APP_ROOT/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs $APP_ROOT/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs $APP_ROOT/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs $APP_ROOT/src/db ./src/db

USER nextjs

ENV PORT=4000
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
