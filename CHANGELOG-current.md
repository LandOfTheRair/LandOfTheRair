## [2.2.5](https://github.com/landoftherair/lotr2/compare/v2.2.4...v2.2.5) (2022-07-08)


### Bug Fixes

* **ai:** support NeverAttack monster groupings to disallow attacks from any NPC ([134d9ea](https://github.com/landoftherair/lotr2/commit/134d9eaf5ed0cb82cc964cfba72d4dff5d5dcc9a))
* **core:** hostility = Never NPCs should not always see their targets ([03e4f21](https://github.com/landoftherair/lotr2/commit/03e4f21b3bb998b7fdeb628889d6fa3e695f449e))
* **core:** itemhelper somehow gets items without mods ([a559eec](https://github.com/landoftherair/lotr2/commit/a559eec1aaa5ac72a052e71dda45ee022a69510d)), closes [#339](https://github.com/landoftherair/lotr2/issues/339)
* **solokar:** npcs will now correctly utilize challenge data for hp/xp/gold numbers ([9e29f2e](https://github.com/landoftherair/lotr2/commit/9e29f2e4cacd5629e77a93628c3a798292e87b63))
* **sub:** players without a sub entering a sub-only area should get teleported out and have their respawn point reset ([bff39f3](https://github.com/landoftherair/lotr2/commit/bff39f38ff24ee1e3dc5ef898c968bd1f8d78a88))
* **tradeskill:** fix inevitable access error for when an unmodded item has no owner ([fe8da76](https://github.com/landoftherair/lotr2/commit/fe8da768b2b8d8d1f8089e13ee4c060aaacc5eb4))
* **ui:** change dialog a bit for teleport ([16d38b2](https://github.com/landoftherair/lotr2/commit/16d38b2bce4a6610c12a5dbf712bddceca2385a7))
* **ui:** no ancient runes list looked a bit wack; hid the list when it shouldn't be there ([7406c1c](https://github.com/landoftherair/lotr2/commit/7406c1c89aab21c473dc36022e2a841a947d028c))


### Features

* **api:** add force reboot option ([22adf43](https://github.com/landoftherair/lotr2/commit/22adf43cae015a8eab55c84bb3254b6c9e51c789))
* **builds:** build manager will now save rune config; merged rune codex + traits into talents ([580aa57](https://github.com/landoftherair/lotr2/commit/580aa57615683a59327a1d2e37b7068f3065d592))
* **core:** add crash context logger to track most recent actions in game pre-crash ([fc0c6d5](https://github.com/landoftherair/lotr2/commit/fc0c6d537337c0f4d7c36ad03f9f8b89f5c4060c)), closes [#340](https://github.com/landoftherair/lotr2/issues/340)
* **core:** new env variable for logging crash context to terminal ([6bfebae](https://github.com/landoftherair/lotr2/commit/6bfebae6e0ad8c97f746226da66102cfbd2dff7b))
* **gm:** allow for overriding spell potencies on the fly if needed for testing ([e515ac3](https://github.com/landoftherair/lotr2/commit/e515ac3ef0d8ce541e7d3e96be4cb8ef973bfadc))
* **npc:** npcs now, generally speaking, use an hp multiplier from their base hp instead of setting it directly ([4d71181](https://github.com/landoftherair/lotr2/commit/4d7118149eebe505f13429730b9acec8556ca15b))
* **npc:** npcs with no set skills or stats will infer the proper default from the game CR data ([5718964](https://github.com/landoftherair/lotr2/commit/5718964216dd8b5f7d0c8c427ceeaa165bbaf92d))
* **solokar:** challengeify mp too for the mod tools sake ([0d763b4](https://github.com/landoftherair/lotr2/commit/0d763b46ebd52501944eaa17575550e5e308b122))
* **tradeskill:** add foundation for 3 new tradeskills ([6bed72e](https://github.com/landoftherair/lotr2/commit/6bed72efc9a5c0a9fbe76e0b9ebfee0a63045764))
* **tradeskill:** npc enchanter can now imbue empty husk items with any rune scroll of the right level ([c5d7a9e](https://github.com/landoftherair/lotr2/commit/c5d7a9e8bfdae31fb68f4818acc8f6d5fd53c21b))
* **tradeskill): add shatter, tear, update DE. new tradeskills (need content:** foodmaking, weavefabricating, gemcrafting ([eccbf93](https://github.com/landoftherair/lotr2/commit/eccbf9329b21cc1be17d574d8b907289f1cb6906))
* **ui:** add new option to show HP value instead of % ([859698e](https://github.com/landoftherair/lotr2/commit/859698ee5148381610a70c8cc08c39324d53dbc7))



