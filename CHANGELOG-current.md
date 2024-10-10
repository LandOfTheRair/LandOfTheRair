# [2.7.0](https://github.com/landoftherair/landoftherair/compare/v2.6.0...v2.7.0) (2024-10-10)


### Bug Fixes

* **client:** make client reload item files every time they log in ([de312f1](https://github.com/landoftherair/landoftherair/commit/de312f1b20cc35ad5f2b6edc4fe136ced5882cd3))
* **core:** createdAt now actually.. works.. whoops! ([4d73411](https://github.com/landoftherair/landoftherair/commit/4d734115357027c59cf9573d04e9da89f2984ffc))
* **core:** make migration functionality a separate helper ([0811b27](https://github.com/landoftherair/landoftherair/commit/0811b27322bd04ae49dbdea767347d1228909a8b))
* **discord:** bug reporting should not try to open a thread with unlimited size messages, closes [#441](https://github.com/landoftherair/landoftherair/issues/441) ([7560e28](https://github.com/landoftherair/landoftherair/commit/7560e2802e2dbb2a371c150749bb7d01c5cc2d0d))
* **discord:** upgrade discord.js, move to slash commands ([199fdf5](https://github.com/landoftherair/landoftherair/commit/199fdf5b00d910674389dd6d259d03738fac44db))
* **errors:** dont report quitting while not logged in. closes [#440](https://github.com/landoftherair/landoftherair/issues/440) ([a3c6c85](https://github.com/landoftherair/landoftherair/commit/a3c6c859735d71763ae53d67d157ec91fc226ab4))
* **item:** item descs are now done in a better, more consistent way, and trait text is fixed ([e4e0fd2](https://github.com/landoftherair/landoftherair/commit/e4e0fd20828b915297c70c427ee3fb02d3573c94))
* **logging:** better logging around a particular kind of error ([880812a](https://github.com/landoftherair/landoftherair/commit/880812abbe04d9a115e91cecdf5886fef2fc2a9e))
* **movement:** make sure there is always some steps, even none, rather than erroring. closes [#437](https://github.com/landoftherair/landoftherair/issues/437) ([2b662cd](https://github.com/landoftherair/landoftherair/commit/2b662cdd67be7cf592017624f1633d7ce1a1f8cb))
* **npc:** healer npc should revive player and take the corpse item away ([7cb3265](https://github.com/landoftherair/landoftherair/commit/7cb32651669e31775272ddd70b8f94e38e81d899))
* **player:** player weapon skill flagging should now work correctly for casters ([fd0f391](https://github.com/landoftherair/landoftherair/commit/fd0f3911ad7b9b01d4e68c22f899e946f5d3c902))
* **player:** remove rune scrolls a player can't technically learn ([e709a3e](https://github.com/landoftherair/landoftherair/commit/e709a3e9476a7605dbc5a83132830cabda9a2235))
* **rng:** rng dungeon decor is correct now in all cases, hopefully ([977e28d](https://github.com/landoftherair/landoftherair/commit/977e28d7353da9fb40d24aa674007c1633312ef8))
* **rng:** rng dungeon trait scroll drops make a bit more sense now ([59e13c8](https://github.com/landoftherair/landoftherair/commit/59e13c81e633889d915740bd6c75803297f676c3))
* **spell:** plague spreading should never spread with a duration of -1 on accident ([1bee490](https://github.com/landoftherair/landoftherair/commit/1bee490ab4adb0bf656dadfb1cb51999bbbbda70))
* **spell:** tp/mt will no longer cost mp to bring up the menu ([c3911ca](https://github.com/landoftherair/landoftherair/commit/c3911cab9c9f3d587e351388c9892bd36fc19e02))
* **spell:** vitalessence AC buff /2 ([d450fdb](https://github.com/landoftherair/landoftherair/commit/d450fdbe92bb67117133e143c92fbea55d8c656a))
* **spell:** vitalessence hp value down by 40% ([2a4f163](https://github.com/landoftherair/landoftherair/commit/2a4f163c6264097fba2afa49b1d926f49251d1ad))
* **ui:** map now shows correct tiles for objects for any tileset ([a8e3fe1](https://github.com/landoftherair/landoftherair/commit/a8e3fe19a5dfe5685d2506660be34e446e1bc816))
* **ui:** really fix arrow/drag interactions ([d0b3e56](https://github.com/landoftherair/landoftherair/commit/d0b3e561751ea07566d0ad3e31e0f6d0d33e1a7b))
* **ui:** windows should always be draggable, arrows should still work too ([8985c64](https://github.com/landoftherair/landoftherair/commit/8985c64fa89df0479048fd3b4ce4f5e3d8f32ed3))


### Features

* **client:** add bug reporting capabilities that sync to discord ([4ee844f](https://github.com/landoftherair/landoftherair/commit/4ee844fd25da633ae9f9de16f222564fecd6e3d2))
* **core:** improve game load time from cold boot by deferring npc initial spawns until after everything has loaded ([db3ac07](https://github.com/landoftherair/landoftherair/commit/db3ac073c06b5f982295f4d187d7335e0713766f))
* **effect:** support waterbreathing and lavabreathing ([d7b55ac](https://github.com/landoftherair/landoftherair/commit/d7b55ac5e911e7e1a9a77d89918b7cb1c990dc0c))
* **event:** events can now spawn events based on a fail/success condition ([2b43032](https://github.com/landoftherair/landoftherair/commit/2b43032e138a2420f387b9535d53908d6eb8118b))
* **gm:** add `[@listplayers](https://github.com/listplayers)` command ([c10a801](https://github.com/landoftherair/landoftherair/commit/c10a801a06a461125433ffac80c1f637c4d52043))
* **gm:** add gearup command ([ca0775f](https://github.com/landoftherair/landoftherair/commit/ca0775fba3a86216b5f9db06cf61a608861433a3))
* **gm:** some GM commands return modal windows now to make parsing information easier ([77049d8](https://github.com/landoftherair/landoftherair/commit/77049d8210014afcf9a523dfcbca0ab2193f3a15))



