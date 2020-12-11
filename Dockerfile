FROM node:15.4.0-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./server/package.json /usr/src/app/
COPY ./server /usr/src/app
COPY ./shared /usr/src/app
RUN npm run setup:prod && npm cache clean --force
RUN npm run build
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "npm", "start" ]