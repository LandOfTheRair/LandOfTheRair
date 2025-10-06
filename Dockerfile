FROM node:22-alpine
RUN apk add --no-cache libc6-compat
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD https://www.google.com /time.now
COPY ./turbo.json /usr/src/app
COPY ./package.json /usr/src/app
COPY ./package-lock.json /usr/src/app
COPY ./packages /usr/src/app/packages
COPY ./apps/server /usr/src/app/apps/server
RUN npm i -g turbo
RUN npm install
RUN turbo run build --filter='!server'
RUN turbo run setup
RUN cd server/content && npm install --unsafe-perm
RUN turbo run build --filter='server'
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD cd server && npm start
