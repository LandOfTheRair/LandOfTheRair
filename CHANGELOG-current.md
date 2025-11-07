# [](https://github.com/landoftherair/lotr2/compare/v2.10.0...v) (2025-11-07)



# [2.10.0](https://github.com/landoftherair/lotr2/compare/v2.9.0...v2.10.0) (2025-11-07)


### Bug Fixes

* **client:** fix secret walls not rendering right ([3f09754](https://github.com/landoftherair/lotr2/commit/3f09754684033992e429efc0c2c439dfb2f8e7a5)), closes [#602](https://github.com/landoftherair/lotr2/issues/602)
* **client:** hide for text if macro isn't custom ([6153930](https://github.com/landoftherair/lotr2/commit/61539306fe9e1704d2d4355a2c477f8dee0df2bf)), closes [#626](https://github.com/landoftherair/lotr2/issues/626)
* **client:** maybe address timing mismatch ([0a4e0d6](https://github.com/landoftherair/lotr2/commit/0a4e0d65183841fa83f989e319010a1af62b8dbc)), closes [#614](https://github.com/landoftherair/lotr2/issues/614)
* **cmd:** lookat should not horizontally scroll output ([16baa67](https://github.com/landoftherair/lotr2/commit/16baa67cdb19bf028a1e06e5a69fdbf2c55d414c))
* **core:** fix bug with npcs dying ([1642628](https://github.com/landoftherair/lotr2/commit/16426289b19bbe892728b4966cf70e1c2d185424))
* **core:** swallow an error that need not be presented ([4d93923](https://github.com/landoftherair/lotr2/commit/4d93923ccf015d1519006d887be094561d3de2b1))
* **event:** fix rarespawn events ([684f6d2](https://github.com/landoftherair/lotr2/commit/684f6d238c8f66298102042f255aa1259c15c42d)), closes [#609](https://github.com/landoftherair/lotr2/issues/609)
* **gm:** respawn command works as expected again ([d286fda](https://github.com/landoftherair/lotr2/commit/d286fdaa8d3b055d178d230a1ae0f8f9dfccc556))
* **math:** make distance use chebyshev distance rather than manhattan ([5040395](https://github.com/landoftherair/lotr2/commit/5040395759bcbc738459704260f954b42c53effe)), closes [#652](https://github.com/landoftherair/lotr2/issues/652)
* **npc:** npcs that heal will no longer draw agro from it ([91ae235](https://github.com/landoftherair/lotr2/commit/91ae23585d1e6afbed4b231a2f5e4a9f44279e04)), closes [#600](https://github.com/landoftherair/lotr2/issues/600)
* **spawner:** call create callback before adding npc to the world ([02f1ed0](https://github.com/landoftherair/lotr2/commit/02f1ed009c0b73151475c9a98acd875008eea150)), closes [#634](https://github.com/landoftherair/lotr2/issues/634)
* **spell:** fix bloody tears/allow it to have a dynamic potency for aura effects ([97a75f4](https://github.com/landoftherair/lotr2/commit/97a75f46191ee2afcfca80f259c339141387bebd))
* **spell:** incoming effects should filter out 0 damage ([8d37406](https://github.com/landoftherair/lotr2/commit/8d37406b14df3edaeebe68a2aeefd71bbf3f6956))
* **spell:** separate spell VFX from their casting functionality, so they no longer double cast when doing ground targetting ([e3cb24d](https://github.com/landoftherair/lotr2/commit/e3cb24d97c5a6762a38e51383dc8502a5314ea74)), closes [#596](https://github.com/landoftherair/lotr2/issues/596)
* **spell:** wizard stance should always respond with damage, even if damage is 0 ([60c15a8](https://github.com/landoftherair/lotr2/commit/60c15a8a8bee342b658b97983a2ced8c2cdd379b))
* **spell:** wizard stance should not allow reflected damage to bounce infinitely ([11292ba](https://github.com/landoftherair/lotr2/commit/11292ba538bf83cc56312a838496b8212b8c9c84))
* **ui:** fix clicking on stairs/etc ([c7af5a3](https://github.com/landoftherair/lotr2/commit/c7af5a3e73d62de92d75db3996704a3f6155a60f)), closes [#621](https://github.com/landoftherair/lotr2/issues/621)


### Features

* **ability:** add 'adaptive' ([fa96743](https://github.com/landoftherair/lotr2/commit/fa96743d60890e05f2683bdec19e0a256845fc8a))
* **client:** add tiny nag about downloading ([55ea2eb](https://github.com/landoftherair/lotr2/commit/55ea2ebf76770f2356dc344bea7d68e3defdc113)), closes [#601](https://github.com/landoftherair/lotr2/issues/601)
* **client:** add ui for renaming builds ([f17ba58](https://github.com/landoftherair/lotr2/commit/f17ba5833b228cd6a80729c6050e512924149919)), closes [#604](https://github.com/landoftherair/lotr2/issues/604)
* **codex:** show rune descs ([c36351f](https://github.com/landoftherair/lotr2/commit/c36351f393b5d48a5981c96f86362314fdb00a90)), closes [#632](https://github.com/landoftherair/lotr2/issues/632)
* **combatdebug:** add lightning/acid resist to combat debug ([da88696](https://github.com/landoftherair/lotr2/commit/da88696242f6640eb37a5486c70929576f4c368c))
* **combat:** items should be able to specify a strike effect that's just an effect, not a spell ([94435d9](https://github.com/landoftherair/lotr2/commit/94435d93117436e292748d56b6a01da561c797d0)), closes [#629](https://github.com/landoftherair/lotr2/issues/629)
* **core:** add 'show traits' command ([9a59a13](https://github.com/landoftherair/lotr2/commit/9a59a13506b455ce60a04931df1a24307f381b0a))
* **core:** add npc that can do gold festivals ([ef868ba](https://github.com/landoftherair/lotr2/commit/ef868ba34477b1261c977902d8c69c93e3672efc)), closes [#548](https://github.com/landoftherair/lotr2/issues/548)
* **core:** add post-build task for packages to restart the server ([7f48572](https://github.com/landoftherair/lotr2/commit/7f4857233882e5df26761aa63da84a2ff8ad0023))
* **core:** add rockpiercer ([b1bbb2c](https://github.com/landoftherair/lotr2/commit/b1bbb2ccf7b315057a2d49590e82cc59e5a1bd1d))
* **core:** better DX for developing/editing maps ([3768044](https://github.com/landoftherair/lotr2/commit/3768044e6bba5fe20a0bb0888d37b73d5df0cd9c))
* **core:** improve lookat to show equipment descs ([3857090](https://github.com/landoftherair/lotr2/commit/3857090737b32ddd54d2c9907c80460c0788074b)), closes [#622](https://github.com/landoftherair/lotr2/issues/622)
* **core:** remove alignment message from lookat, showstats, showskills ([32e8555](https://github.com/landoftherair/lotr2/commit/32e8555901808590262122f794c1b69bd7a9de9d)), closes [#623](https://github.com/landoftherair/lotr2/issues/623)
* **core:** support faster spawners. add event to event planner ([2388d3f](https://github.com/landoftherair/lotr2/commit/2388d3f2ba9bb664c84a68dd3e30607c8e44276e)), closes [#548](https://github.com/landoftherair/lotr2/issues/548)
* **core:** upgrades can now boost trait levels ([6ab0bbf](https://github.com/landoftherair/lotr2/commit/6ab0bbf8a5d645bd40148ca9400777b63ab24264))
* **gm:** improve force reboot to kick all players first ([618cafc](https://github.com/landoftherair/lotr2/commit/618cafcf21623dd305d9f5d6f4dd7ac1244f7c0c))
* **item:** add trinket. add trinket slot. add facets that make this system work. ([0789896](https://github.com/landoftherair/lotr2/commit/07898964b468d2eee917c8edb14c0e0440d687c9)), closes [#650](https://github.com/landoftherair/lotr2/issues/650)
* **item:** show upgrade descriptions in item text ([fbd48d9](https://github.com/landoftherair/lotr2/commit/fbd48d916c69484ff854917c720f89cb87f0e640)), closes [#635](https://github.com/landoftherair/lotr2/issues/635)
* **rng:** move ring/amulet stats to config, rather than being in code where I'll forget about them ([21aae7e](https://github.com/landoftherair/lotr2/commit/21aae7e4d04fe7f31c29c33144d84efadfd73afa)), closes [#603](https://github.com/landoftherair/lotr2/issues/603)
* **rng:** rng dungeons have a slightly more sensible config ([da44ede](https://github.com/landoftherair/lotr2/commit/da44ede6da3133e0a503b4c017a56b0d75ab3343))
* **spell:** add augmented strikes ([89f91ab](https://github.com/landoftherair/lotr2/commit/89f91abb903aa198dfa35394c8d74b5da8e18dd5))
* **spell:** add baracid/barlightning ([b7bf7c0](https://github.com/landoftherair/lotr2/commit/b7bf7c0c34479b06b68da036ddee17d137992adf))
* **spell:** add corrosion buildup/burst functionality ([20397fc](https://github.com/landoftherair/lotr2/commit/20397fc0074054b81d6421e0c2aaec4919c29bc9))
* **spell:** add curse of decay ([4333719](https://github.com/landoftherair/lotr2/commit/43337191885d7ecae03498e1e9981d4ab391e5b9))
* **spell:** add cursewarden, change cleanse to be 1-of ([693e694](https://github.com/landoftherair/lotr2/commit/693e6942647b07c9d1eee3c42e71d4682b1cacad))
* **spell:** add passwall ([cc3f064](https://github.com/landoftherair/lotr2/commit/cc3f0649114891b744d3f95834decf68ce1e83b9)), closes [#618](https://github.com/landoftherair/lotr2/issues/618)
* **spell:** add thirdeye ([9074b8c](https://github.com/landoftherair/lotr2/commit/9074b8c2bf2d21eabf1cfbded11f87cb7508c727))
* **spell:** when taking relevant acid damage, deal armor damage. add shock/acid bites ([03c652f](https://github.com/landoftherair/lotr2/commit/03c652f42deb407001346b8ede0481cffd52e228))
* **statistics:** track ap and total achievements ([4e3eed0](https://github.com/landoftherair/lotr2/commit/4e3eed0632b18caf6c44c570d2d0381ecf4f2232))
* **trait:** add martial weapons trait ([1cba449](https://github.com/landoftherair/lotr2/commit/1cba4490e5ea3f8f4febe4723e7551c0941af2c3)), closes [#651](https://github.com/landoftherair/lotr2/issues/651)



