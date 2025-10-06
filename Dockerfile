FROM node:22-alpine
RUN apk add --no-cache libc6-compat
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD https://www.google.com /time.now
COPY ./package.json /usr/src/app
COPY ./package-lock.json /usr/src/app
RUN npm install
RUN cd apps/server && npm run setup && npm cache clean --force
RUN cd apps/server/content && npm install --unsafe-perm
RUN cd apps/server && npm run build
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD cd apps/server && npm start
