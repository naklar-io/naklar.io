FROM node:14.2.0-alpine AS builder

WORKDIR /usr/src/app

COPY ./naklario/package*.json ./

RUN npm i

COPY ./naklario ./

RUN npm run build:ssr



FROM node:14.2.0-alpine

COPY --from=builder /usr/src/app/dist /dist

ENTRYPOINT ["nice", "-10", "node", "/dist/naklario/server/main.js"]
