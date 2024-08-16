## [2.2.6](https://github.com/landoftherair/lotr2/compare/v2.2.5...v2.2.6) (2024-08-16)


### Bug Fixes

* **core:** prevent non-items from being attempted to be added to the ground ([8bb6149](https://github.com/landoftherair/lotr2/commit/8bb61498d30a383278ec6c3fbd20eb28d1f5d315)), closes [#347](https://github.com/landoftherair/lotr2/issues/347) [#346](https://github.com/landoftherair/lotr2/issues/346)
* **crafting:** tear should work on flowers now ([64db5c8](https://github.com/landoftherair/lotr2/commit/64db5c842944a0d3c30b294085e9606ae7180138))
* **event:** make it so double trouble cant keep targetting the same npc over and over. closes [#385](https://github.com/landoftherair/lotr2/issues/385) ([d4d930d](https://github.com/landoftherair/lotr2/commit/d4d930d29db2e23e7e448ff83b07718d3924bd9d))
* **events:** dynamic events will not happen unless there is at least one player online, preventing lots of spam ([b2e56a1](https://github.com/landoftherair/lotr2/commit/b2e56a16a163a18e3d8427b78fe076452a494b52))
* **gm:** create gm command now emits the correct message ([6146fce](https://github.com/landoftherair/lotr2/commit/6146fce4d290015cce1cee784321542b98a49126))
* **gm:** create gm command now emits the correct message ([c26f659](https://github.com/landoftherair/lotr2/commit/c26f65909e02f60266082350e7ef694c3ddcc4b4))
* **materials:** identical items on the ground will go into material storage (or fail) rather than try to piecemeal them in. closes [#348](https://github.com/landoftherair/lotr2/issues/348) ([346a413](https://github.com/landoftherair/lotr2/commit/346a4135fcaa8ceb0598e55125e8a18272b2fe55))
* **npc:** artificer will now take exactly as many items as required, closes [#349](https://github.com/landoftherair/lotr2/issues/349) ([cd5870b](https://github.com/landoftherair/lotr2/commit/cd5870b1e99a71cf1c2d6d4dccaa55bbd2f6f185))
* **rng:** hopefully better handling of loading rng dungeons ([5c65401](https://github.com/landoftherair/lotr2/commit/5c65401d23db47993b52083253634c05ce13aa7c))
* **spell:** eagle eye now shows invisible things as intended. closes [#401](https://github.com/landoftherair/lotr2/issues/401) ([40be9a2](https://github.com/landoftherair/lotr2/commit/40be9a2937451b371a3154c6119aeefeaba7a394))
* **spell:** massteleport will no longer go on cooldown while the dialog is open ([3628e67](https://github.com/landoftherair/lotr2/commit/3628e67fad1378e88fbcf0a206109ada6b15262f))
* **stats:** xp/skill% stats now work correctly. closes [#350](https://github.com/landoftherair/lotr2/issues/350) ([a519684](https://github.com/landoftherair/lotr2/commit/a519684ea2828ba431b722065001d85b96eced43))
* **transmute:** transmute base potency 30 -> 10, phil stone 20 -> 10 ([8ce4fa3](https://github.com/landoftherair/lotr2/commit/8ce4fa308d482d8968dc207ded5b158855a4f1a0))
* **ui:** hide death border when appropriate, whoops! closes [#407](https://github.com/landoftherair/lotr2/issues/407) ([4ac5eff](https://github.com/landoftherair/lotr2/commit/4ac5effdbffab32b6abc9d13a900ef4b8a26060b))


### Features

* **charlist:** rework char list to be a bit more performant ([e46d8af](https://github.com/landoftherair/lotr2/commit/e46d8af8574807d2b5dfa31b479c2100c6d9a431))
* **gm:** add [@modcreature](https://github.com/modcreature) ([3939e36](https://github.com/landoftherair/lotr2/commit/3939e3665d9a45a748980bcc1a10bb47424406d1))
* **levelup:** tell players how much hp and mp they get on level ([7080aa0](https://github.com/landoftherair/lotr2/commit/7080aa0ec869c27f7d01ab9286ba7323898f275b))
* **login:** improve asset loading process on login ([e98a02d](https://github.com/landoftherair/lotr2/commit/e98a02d4ec225a72cc9a720e57939baf483b8cdc))
* **map:** support isTester blocks for teleporters (blocks anyone not a tester or GM) ([ad003b6](https://github.com/landoftherair/lotr2/commit/ad003b66f2d09efbfd54fa23cb4c84d5bfe748db))



