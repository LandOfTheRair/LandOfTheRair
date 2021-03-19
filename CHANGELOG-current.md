# [1.12.0](https://github.com/landoftherair/lotr2/compare/v1.11.0...v1.12.0) (2021-03-19)


### Bug Fixes

* **bottles:** useonly bottles would break because there is no effect list for useonly ([0761ec1](https://github.com/landoftherair/lotr2/commit/0761ec1fc297a4c452d10343e73faeebde2bcfe5))
* **ground:** can no longer save corpses in the DB ([dec9d10](https://github.com/landoftherair/lotr2/commit/dec9d10d6c68d98ce06ac39bb3bf8497e31fada9))
* **locker:** fix auto close on locker ([23bd963](https://github.com/landoftherair/lotr2/commit/23bd9635f80ba670c271bb82d195108e213b0f0c))
* **locker:** lockers should not nest two layers deep for no reason ([049a3b6](https://github.com/landoftherair/lotr2/commit/049a3b665825d5484dc386fa7d4aae8cf84d402b))
* **map:** fix spring water tiles not swimming properly ([60f043f](https://github.com/landoftherair/lotr2/commit/60f043f309692f887fa9d69390f524ef3cca60f4))
* **map:** render different layers correctly when crossing file boundaries ([6d1ea09](https://github.com/landoftherair/lotr2/commit/6d1ea0905bddbed39b1de5b9c0c9d3b0bcda4d68))
* **premium:** premium tier should be correctly set for gm/tester accounts on player login ([da1aae2](https://github.com/landoftherair/lotr2/commit/da1aae223f2f24b70dee2c622fae6cec1996590e))
* **ui:** ground item stacking would incorrectly report number of items if they were the same item but a different count ([e9eba0c](https://github.com/landoftherair/lotr2/commit/e9eba0c3a957d56f807a85489e09587de84e485e))
* **ui:** hide quick/codex by default ([5d31b76](https://github.com/landoftherair/lotr2/commit/5d31b76eb26970033917a5e4d5c88bd950cff7d4))
* **ui:** make char selector same height as lobby ([31a6eb2](https://github.com/landoftherair/lotr2/commit/31a6eb2a7621f192c63455d68aa3090fb0338c0b))


### Features

* **door:** doors can now require quest completion or progress to pass ([5ec56f8](https://github.com/landoftherair/lotr2/commit/5ec56f861789abb6f5b8c6f19c2df317d958c6da))
* **gear:** force save gear that is stripped off always ([61475e8](https://github.com/landoftherair/lotr2/commit/61475e8a1b380260f3b8605d5676d67c2549935e))
* **identify:** add sense1, sense2, and thief1 to identify ([bf79f7e](https://github.com/landoftherair/lotr2/commit/bf79f7e0f1c1c67257f830a9846e117f69e7e6a9))
* **instances:** instanced maps. treasure chests. crazed saraxa. ([126f710](https://github.com/landoftherair/lotr2/commit/126f71036f5a210903df7178fff090c68cbd0121))
* **luk:** luk now rolls 1..luk as a bonus instead of just rolling straight +luk for everything ([0a91574](https://github.com/landoftherair/lotr2/commit/0a915744acad0c90568c3a07739e3ad2f4ab82f3))
* **npc:** add hall of heroes npcs correctly ([41cd397](https://github.com/landoftherair/lotr2/commit/41cd397c8975a653c1046d1dfb08e55ef1c029f7))
* **npc:** mood attribute works ([45180b2](https://github.com/landoftherair/lotr2/commit/45180b20b552835f564e97309b9ee1843bad81db))
* **npc:** npcs can now have attributes again ([136601e](https://github.com/landoftherair/lotr2/commit/136601e91b953923fb6213ef7bd78268019091d7))
* **parties:** add parties ([b7399e0](https://github.com/landoftherair/lotr2/commit/b7399e00e51c418691b3dbe43902a0e0fb186d94))
* **premium:** add premium. all perks work, but cosmetics cannot be retrieved yet ([470abd8](https://github.com/landoftherair/lotr2/commit/470abd8ba7f4804635e9e7b51b8aae3e2492bb20))
* **resources:** resources now take the correct amount of physical damage and deal condition damage appropriately ([5728aff](https://github.com/landoftherair/lotr2/commit/5728aff2bfc3aebb73ee360b35630b6f756796ec))
* **showstats:** show stats command now offers 'all' again ([20c7949](https://github.com/landoftherair/lotr2/commit/20c7949eb3467bfe2651d50cfeec6b3cb02d2c7a))
* **spell:** add truesight ([cdce5e1](https://github.com/landoftherair/lotr2/commit/cdce5e1295e089dcb13fffd49876fd8b1e4b90de))
* **statistics:** track name and class and xp and level ([308d13d](https://github.com/landoftherair/lotr2/commit/308d13d7c3a6232f35f1121c7ded3b23e7ff0dbe))
* **ui:** add quick ui w/ left,right,coin,potion slots ([6077b70](https://github.com/landoftherair/lotr2/commit/6077b709171ea95fb063cc8e72affef50c1fbf57)), closes [#29](https://github.com/landoftherair/lotr2/issues/29)
* **ui:** add tooltips to all small buttons on the ui bars ([9c6d65e](https://github.com/landoftherair/lotr2/commit/9c6d65e5b7de4cca308b3765d48ae903714bbc0e))
* **ui:** can now auto exec commands on join game ([aa952b9](https://github.com/landoftherair/lotr2/commit/aa952b9c1a073d47a5759e3ce604e3ee5fdf1d75))
* **ui:** show current holiday on popup if there is one going on ([4082b89](https://github.com/landoftherair/lotr2/commit/4082b895a92380bdf394682d92b5f19d99b3be11))



