# Land of the Rair

This is the backend for Land of the Rair.

## Requirements

* Node.js 14+
* MongoDB (or MongoDB Atlas - easier)

## Installation

* `npm install`
* `npm run setup`
* `npm start`

## Debugging

A good way of debugging the server is compiling it, then running ndb on the output. A way to get set up is as follows:

- `npm i -g ndb`
- `npx tsc`
- `ndb npm start` (this will run the server in prod mode)

## Environment Variables

Put any environment variables in a [`.env`](https://github.com/motdotla/dotenv) file.

### Game Variables

* `BLOCK_REGISTER` - (optional) set this to any value to block registration of new accounts - useful if you require accounts to be manually created for some reason
* `DISABLE_TIMERS` - (optional) disable the timer reporting for game loop lag

### Networking Variables

* `PORT` - (optional) the port for the game / api server to run on (default `6975`)
* `DATABASE_URI` - (optional) the path to your mongodb database (default `mongodb://localhost:27017/`)
* `WEBHOOK_SECRET` - (optional) the secret to use for GitHub webhooks to restart the server when doing CI/CD 
* `BIND_ADDR` - (optional) set this to `0.0.0.0` or any other IP you want to bind the server to - useful in Docker-like contexts

### Rollbar Variables

* `ROLLBAR_TOKEN` - (optional) the POST token for Rollbar

### Discord Variables

* `DISCORD_SECRET` - (optional) set this to the Discord API secret for the Discord bot
* `DISCORD_GUILD_ID` - (optional) set this to the Discord Guild ID you want the bot to listen to
* `DISCORD_CHANNEL_ID` - (optional) set this to the Discord Channel you want the bot to bridge messages between
* `DISCORD_BOT_CHANNEL_ID` - (optional) set this to the Discord Channel you want the bot to handle commands in
* `DISCORD_MARKET_CHANNEL_ID` - (optional) set this to the Discord Channel you want the bot to post marketplace updates in

### Stripe Variables

* `STRIPE_TOKEN` - (optional) set this to the `sk_test` or `sk_live` key depending on which Stripe environment you want to test

### Papertrail Variables

* `PAPERTRAIL_HOST` - (optional) set this to `logsX.papertrailapp.com` (given by Papertrail)
* `PAPERTRAIL_PORT` - (optional) set this to `XXXXX` (given by Papertrail)

### SMTP Variables

* `SMTP_SERVICE` - (optional) the SMTP service to use (default: `gmail`)
* `SMTP_EMAIL` - (optional) the SMTP email to sign in as
* `SMTP_PASSWORD` - (optional) the SMTP email password to use

### Test Mode Variables

* `TEST_MODE` - (optional) set this to any value to enable test mode
* `TEST_USER_NAME` - (optional) the username to use for mod testing
* `TEST_USER_PASSWORD` - (optional) the password to use for mod testing
* `TEST_USER_PROPS` - (optional) a JSON blob of properties to set on the character for mod testing

### Mod Support

* `MODS_TO_LOAD` - (optional) a comma separated list of mods to load (by file name)

## Discord Setup

To set up Discord, you'll need the above environment variables (`DISCORD_*`) and the following roles set by name in your server:

* `Verified` - users who link their account with Discord
* `Online In Lobby` - users who want to appear always online in the lobby
* `Subscriber` - users who subscribe to the game
* `Event Watcher` - users who want to get notifications about in-game events

## Testing While Using the Prod Client

You can append `?apiUrl=localhost:6795` (or whatever you set the port to) to the URL of the production client (`https://play.rair.land/`) to test your changes locally. 
