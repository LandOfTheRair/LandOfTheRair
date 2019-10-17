
# Land of the Rair

This is a monorepo. For a specific project setup/config, check those project subfolders (for example, the `server` needs a `.env` setup before it will run.).

## Getting Started

You can either use docker, or you can use your own installed Node / Mongo / Redis (or, of course, a hosted Mongo / Redis).

### Docker

Just run `docker-compose up` and it will build, run, and start the client and server (as well as Mongo and Redis).

### Your Installed Node

You will want to be using Node 12 (at least) to run this project.

#### Setup

* `npm install` - install dependencies for the client and server.
* `npm run setup` - setup both the client and server for development.

#### Running Both Projects

Run `npm start` and the client and server will both start up.