FROM node:22-alpine AS build

WORKDIR /home/websocket

COPY . ./

RUN npm ci && \
  npm run build


FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /home/websocket

COPY --from=build /home/websocket/dist ./dist
COPY package*.json ./

# Only install production dependencies
RUN npm ci --omit=dev

# Don't run as root!
USER node

CMD [ "npm", "start" ]
