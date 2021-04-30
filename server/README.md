# Land of the Rair

This is the backend for Land of the Rair.

## Requirements

* Node.js 14+
* MongoDB (or MongoDB Atlas - easier)

## Installation

* `npm install`
* `npm run setup`
* `npm start`

## Environment Variables

Put any environment variables in a [`.env`](https://github.com/motdotla/dotenv) file.

* `DATABASE_URI` - the path to your mongodb database
* `ROLLBAR_TOKEN` - (optional) the POST token for Rollbar
* `WEBHOOK_SECRET` - (optional) the secret passed along to validate webhook pushes
* `BLOCK_REGISTER` - (optional) set this to any value to block registration of new accounts - useful if you require accounts to be manually created for some reason
* `BIND_ADDR` - (optional) set this to `0.0.0.0` or any other IP you want to bind the server to - useful in Docker-like contexts
* `DISCORD_SECRET` - (optional) set this to the Discord API secret for the Discord bot
* `DISCORD_GUILD_ID` - (optional) set this to the Discord Guild ID you want the bot to listen to
* `DISCORD_CHANNEL_ID` - (optional) set this to the Discord Channel you want the bot to bridge messages between
* `DISCORD_BOT_CHANNEL_ID` - (optional) set this to the Discord Channel you want the bot to handle commands in
* `STRIPE_TOKEN` - (optional) set this to the `sk_test` or `sk_live` key depending on which Stripe environment you want to test
* `SMTP_SERVICE` - (optional) the SMTP service to use (default: `gmail`)
* `SMTP_EMAIL` - (optional) the SMTP email to sign in as
* `SMTP_PASSWORD` - (optional) the SMTP email password to use

## Discord Setup

To set up Discord, you'll need the above environment variables (`DISCORD_*`) and the following roles set by name in your server:

- `Verified` - users who link their account with Discord
- `Online In Lobby` - users who want to appear always online in the lobby
- `Subscriber` - users who subscribe to the game
- `Event Watcher` - users who want to get notifications about in-game events
