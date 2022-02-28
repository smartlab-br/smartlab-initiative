FROM smartlab/nuxt-vuetify-node:17-alpine AS build_engine
# TODO - Transpile code into dist
COPY --chown=node:node . /app/
# RUN npm install
RUN npm run build

# Imagem a ser gerada
FROM smartlab/nuxt-vuetify-node:14-alpine
# Reduce copied files to dist dir
COPY --from=build_engine --chown=node:node /app/.nuxt /app/.nuxt
COPY --from=build_engine --chown=node:node /app/assets /app/assets
COPY --from=build_engine --chown=node:node /app/server-middleware /app/server-middleware
COPY --from=build_engine --chown=node:node /app/static /app/static
COPY --from=build_engine --chown=node:node /app/package.json /app/package.json
COPY --from=build_engine --chown=node:node /app/nuxt.config.js /app/nuxt.config.js

CMD ["start"]