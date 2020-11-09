# Land of the Rair

This is the backend for Land of the Rair.

## Requirements

* Node.js 12+
* MongoDB (or MongoDB Atlas - easier)

## Installation

* `npm install`
* `npm run setup`
* `npm start`

## Environment Variables

Put any environment variables in a [`.env`](https://github.com/motdotla/dotenv) file.

* `TS_NODE_TRANSPILE_ONLY` - set this to `1` if you want the dev server to start up a little bit faster
* `DATABASE_URI` - the path to your mongodb database

### Optional Variables

You can also use these variables for various features:

* `DATABASE_QUERY_DEBUG` - set this to `1` if you want to debug DB queries