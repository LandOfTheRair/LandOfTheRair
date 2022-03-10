# [2.2.0](https://github.com/landoftherair/lotr2/compare/v2.1.6...v2.2.0) (2022-03-10)


### Bug Fixes

* **chat:** only player messages will be forced to wrap; npc or game messages will no longer force wrap in the middle of a word ([7e5af9f](https://github.com/landoftherair/lotr2/commit/7e5af9fa7bd877fff81f65972e2debfa5d48403b))
* **core:** if no map state can be obtained for a player, return an empty array for targetting; fix typing to reflect sometimes undefined ([3c2889e](https://github.com/landoftherair/lotr2/commit/3c2889e5ddd908e679d7c2969e765c2f7bcd1686)), closes [#317](https://github.com/landoftherair/lotr2/issues/317)
* **death:** remove awkward death loop causing inconsistent player map counts & players getting multiple map states simultaneously; also support respawnKick ([89d9a8d](https://github.com/landoftherair/lotr2/commit/89d9a8d10b61959f34e22eb1fa7bcfed17629fc1))
* **ui:** npcs will do a better job of re-existing if their sprite does not currently exist. they may still appear invisible but should re-appear when the player moves ([2f5954b](https://github.com/landoftherair/lotr2/commit/2f5954bc4a227c042a8f73f064ed3baef0e6bd1e)), closes [#268](https://github.com/landoftherair/lotr2/issues/268)


### Features

* **trait:** add pandemic trait ([3b9b97c](https://github.com/landoftherair/lotr2/commit/3b9b97c0bc17c1f4aa17ed9a054968f25ecffb43))



