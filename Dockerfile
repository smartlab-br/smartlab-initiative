FROM node:16-alpine

EXPOSE 8080
WORKDIR /app

COPY . .
RUN apk update && \
    apk upgrade && \
    npm ci && \
    npm run build && \
    chown -R node:node /app 

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8080

USER node
CMD ["npm", "run", "start"]
