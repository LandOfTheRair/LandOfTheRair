# [2.8.0](https://github.com/landoftherair/landoftherair/compare/v2.7.2...v2.8.0) (2025-09-26)


### Bug Fixes

* **client:** assets will load from a FQDN rather than locally, hopefully busting caches ([f33bce4](https://github.com/landoftherair/landoftherair/commit/f33bce4d1a8a1d56f65401f0c8d1bf4bbc41eb1c))
* **client:** client $targetting macros work while hidden again ([2415b59](https://github.com/landoftherair/landoftherair/commit/2415b59d39f6066a229f19629fcbab1174a165a8))
* **client:** client will no longer try to interact with a door twice ([a7fa0a3](https://github.com/landoftherair/landoftherair/commit/a7fa0a3336ec9e8567556bd2215e8e554ddfc7af))
* **combat:** shields will no longer block if you can't use them ([a7a4b49](https://github.com/landoftherair/landoftherair/commit/a7a4b49d7c91989b5873ddd41f7c7f7fbf6aee77)), closes [#471](https://github.com/landoftherair/landoftherair/issues/471)
* **core:** disable registerfor similar (case-insensitive) user/password ([74f6b47](https://github.com/landoftherair/landoftherair/commit/74f6b47c2fbf930f582b1fce5a43bd46ff3d3db7)), closes [#462](https://github.com/landoftherair/landoftherair/issues/462)
* **core:** make all teleport-type actions (stairs, climb, teleport) consistent and streamlined ([4825955](https://github.com/landoftherair/landoftherair/commit/4825955be3d7d015dac0e54554735ddf87155948))
* **core:** refactor lobby system messages to be done simpler ([cfdc790](https://github.com/landoftherair/landoftherair/commit/cfdc790714e72e22078dd12ede28e9fee3de85bd))
* **core:** remove invalid traits on login ([ab5325d](https://github.com/landoftherair/landoftherair/commit/ab5325d692b728cdd623f50ed58a882568c99dec))
* **email:** fix email sender stuff to work correctly ([f7ade47](https://github.com/landoftherair/landoftherair/commit/f7ade47a1529bf559a7048d5ccddaaf48348135a)), closes [#461](https://github.com/landoftherair/landoftherair/issues/461)
* **gm:** dont throw errors for invalid items ([8fa8279](https://github.com/landoftherair/landoftherair/commit/8fa8279de28967ba1c28187f9441e29495e3585a))
* **instances:** instanced maps get their spawners back ([a053907](https://github.com/landoftherair/landoftherair/commit/a05390732a2d89a9fbebfc23188f4d53472b0045))
* **map:** gold sprite should work for all cases ([1579b77](https://github.com/landoftherair/landoftherair/commit/1579b770f3cecf2ac41992964b848515c8d42688)), closes [#498](https://github.com/landoftherair/landoftherair/issues/498)
* **map:** teleport objects that are self-map-referential will work again ([225076e](https://github.com/landoftherair/landoftherair/commit/225076e7e80336abd773fa19e74ee41a0daf610b)), closes [#473](https://github.com/landoftherair/landoftherair/issues/473)
* **perf:** don't send redundant copies of effects ([c600b6a](https://github.com/landoftherair/landoftherair/commit/c600b6ac827a6a4aae37db7601fff94a55d97e94)), closes [#505](https://github.com/landoftherair/landoftherair/issues/505)
* **rng:** ori/sol creatures get MP now ([e0ade94](https://github.com/landoftherair/landoftherair/commit/e0ade944393abf8eee8ff10d3f35bb8968e06352))
* **rng:** rng npcs now spawn with correct stats/skills/etc ([6b55c57](https://github.com/landoftherair/landoftherair/commit/6b55c57165088eaa427e9ea428208bb21ff93de7))
* **skill:** rapidpunch no longer works from a distance ([b10e6e0](https://github.com/landoftherair/landoftherair/commit/b10e6e088ffb9b90fb45d49ccd2ebd945733b5e1)), closes [#480](https://github.com/landoftherair/landoftherair/issues/480)
* **spawner:** fix all other spawner abilities not working ([b50463c](https://github.com/landoftherair/landoftherair/commit/b50463cd389508dd1f3abbe55499877349c9765a))
* **spell:** aoe spells should not go through walls ([fd1a266](https://github.com/landoftherair/landoftherair/commit/fd1a2669f603a8b31e8141111134e29cf718b5f2)), closes [#504](https://github.com/landoftherair/landoftherair/issues/504)
* **spell:** transmute will only transmute 100 items at a time ([b5571e6](https://github.com/landoftherair/landoftherair/commit/b5571e61d9638522ce8437e3854280b2438f580b)), closes [#476](https://github.com/landoftherair/landoftherair/issues/476)
* **trade:** can no longer trade corpses or succors ([fb5e0f5](https://github.com/landoftherair/landoftherair/commit/fb5e0f5847d7c6159ad437437fa361b7d53798c8))
* **trait:** bouncing traits (missile, arrow) now use a different targetting mechanism ([2ae2f50](https://github.com/landoftherair/landoftherair/commit/2ae2f5082da81d0311204905ba51a66cb558b075))
* **trait:** fix removing traits that are correctly learned ([ef4158f](https://github.com/landoftherair/landoftherair/commit/ef4158f889a0401737299ec3230608d8956a07e5)), closes [#483](https://github.com/landoftherair/landoftherair/issues/483)
* **ui:** characters in view now properly allows gaps again ([a45b4bf](https://github.com/landoftherair/landoftherair/commit/a45b4bfb9b02abf24bc6a631de266055412de7b4))
* **world:** spawners should serialize/deserialize properly. also, spawner spawning is tied to the game loop rather than a separate timer. also, make it so some teleports won't work until the world is fully loaded ([4229028](https://github.com/landoftherair/landoftherair/commit/4229028690082e03dd3f9b3aa07263e05762d328))


### Features

* **effect:** add new bonus xp/skill gains effect, add command to set it ([d4dc32e](https://github.com/landoftherair/landoftherair/commit/d4dc32e1c1422e859b93cbc2313b61962c7d76d0)), closes [#512](https://github.com/landoftherair/landoftherair/issues/512)
* **gm:** allow avatar spawn to specify a map ([f910151](https://github.com/landoftherair/landoftherair/commit/f910151134b7be37fe9ae8c7ea89fb06318cc2e1)), closes [#502](https://github.com/landoftherair/landoftherair/issues/502)
* **gm:** eval command now uses modal sendback ([3063c4a](https://github.com/landoftherair/landoftherair/commit/3063c4afa5e8df958db30af2a24f8fa459676d43))
* **guild:** show guild in char select ([98404ac](https://github.com/landoftherair/landoftherair/commit/98404acacfd2acd775625b264c97ce1c2506c51e))
* **item:** recipe books now tell you what the requirements are on use ([bcbd2fb](https://github.com/landoftherair/landoftherair/commit/bcbd2fbaa4a3407a89f163b0c482802ffc8ec97e))
* **item:** show class restrictions on rune scrolls ([9509364](https://github.com/landoftherair/landoftherair/commit/9509364bf85725132c91782f89f3ee8d488d5e3f))
* **macro:** support $target as a click/macro replacement ([f0386b7](https://github.com/landoftherair/landoftherair/commit/f0386b729b80a58e40eb85d2581dbe7fa9b76940))
* **npc:** add drain bite skills ([66e7494](https://github.com/landoftherair/landoftherair/commit/66e749489137d2b37f75154d5139c7699c7f0e47))
* **rng:** rng dungeons now scale item stats in them ([fcd34cd](https://github.com/landoftherair/landoftherair/commit/fcd34cdc27b8030553f02ca4a83af132203854ee))
* **skill:** add water damage buildup/etc ([96e686b](https://github.com/landoftherair/landoftherair/commit/96e686b95eba0a5937f610de1987c95f0c7242a5))
* **skill:** disease/poison/drain bite scale with level ([cd5a9fa](https://github.com/landoftherair/landoftherair/commit/cd5a9faa9889915d4ca8dc423e889a86d48b7682))
* **trait:** add familiarskill trait ([a10004b](https://github.com/landoftherair/landoftherair/commit/a10004bd519ad87bfc73727d450533bdcf5b363e)), closes [#494](https://github.com/landoftherair/landoftherair/issues/494)
* **ui:** warn if doing an irreversible action on a self-bound item ([d8222c9](https://github.com/landoftherair/landoftherair/commit/d8222c929eda6db9d34f29a9c4da6cc6f5101fdb))
* **xp:** xp will slowly increase in requirements post-20 ([5cb74da](https://github.com/landoftherair/landoftherair/commit/5cb74dae26cebb0fd86ede58697b3f8d35152135)), closes [#468](https://github.com/landoftherair/landoftherair/issues/468)



