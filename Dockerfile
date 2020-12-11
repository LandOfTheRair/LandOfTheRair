FROM node:15.4.0-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./server /usr/src/app/server
COPY ./shared /usr/src/app/shared
RUN cd server && npm run setup && npm cache clean --force
RUN cd server && npm run build
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "npm", "start" ]