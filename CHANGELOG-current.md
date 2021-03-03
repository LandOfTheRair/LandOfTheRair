## [1.10.1](https://github.com/landoftherair/lotr2/compare/v1.10.0...v1.10.1) (2021-03-03)


### Bug Fixes

* **bind:** items should bind on add to sack/belt as well as hands ([8380356](https://github.com/landoftherair/lotr2/commit/8380356c1cbd1c8dc167d239bd9f65cd2776ed07))
* **bottle:** healing bottles would throw an error on drink ([74c9acf](https://github.com/landoftherair/lotr2/commit/74c9acfbd39d8b7f0d5b1c1976f914d17ce07fbe))
* **combat:** "you dont see that person" should show up less - clicking is disabled for 250ms after clicking to avoid spam ([a72bd61](https://github.com/landoftherair/lotr2/commit/a72bd617de5cda75820504e2665fcb3654cdfd1d))
* **combat:** attempt  to make cstun not hit the same person twice while they're stunned ([2491c31](https://github.com/landoftherair/lotr2/commit/2491c315f6e8279e0410b266f18a460abe07abdf))
* **combat:** target would be cleared in strange situations for no reason ([b5ad374](https://github.com/landoftherair/lotr2/commit/b5ad374370e8b3bf968b4faa34e5ae5010183907))
* **lobby:** character select no longer uses mat-tabs - homegrown solution instead - will work for now ([9641d53](https://github.com/landoftherair/lotr2/commit/9641d5349c3588996a80e09dfe6de88307c787aa))
* **macro:** custom macros are now per-character, and macros with hotkeys will only work on the character they were made for ([adeb74d](https://github.com/landoftherair/lotr2/commit/adeb74df578f1659680c5d1f5f21f5310cdcaf0d))
* **macro:** macro popup no longer exists; instead it is inline ([754785b](https://github.com/landoftherair/lotr2/commit/754785b37508f3dd877225e3745885e73c1b5414))
* **macro:** macros are now only accessible to the character slot that created them ([87103c9](https://github.com/landoftherair/lotr2/commit/87103c91f5d407e4a82d3822567580b464e017e5))
* **npc:** npcs should always pathfind if they're >1 space away from their target ([0589317](https://github.com/landoftherair/lotr2/commit/05893176e7bb6deb0902313391150e3a65aeda16))
* **skill:** skill gain was not working when you had a skill you had never used before ([479c4c2](https://github.com/landoftherair/lotr2/commit/479c4c2cdb11d11a0292520dab1cac818455e0de))
* **ui:** unhide progress/max for quests ([9c0e71e](https://github.com/landoftherair/lotr2/commit/9c0e71e0d17ccfc6351c60fcdefc06a6ee7345c0))


### Features

* **events:** introduce dynamic event system. for now, only applies to gm-started festivals, but will be expanded ([64d9e80](https://github.com/landoftherair/lotr2/commit/64d9e807e5efa9c0d6de3eb55ffe7a76969c43f4))
* **game:** add discord support: events command, cross-chat support, emoji support, welcome broadcasts ([2deb2e0](https://github.com/landoftherair/lotr2/commit/2deb2e0e042c10c9e13f94955fde74276baa36f6))
* **gm:** add gm lobby commands: alert, ban, creategm, createtester, motd, mute ([0e3da68](https://github.com/landoftherair/lotr2/commit/0e3da686692d3dc823c2014549182f445b5ac2e8))
* **stats:** track some internal statistics for a leaderboard ([f8934a1](https://github.com/landoftherair/lotr2/commit/f8934a143f4176b1d88245752a439d6558f76c0d))
* **ui:** items will now tell you why you can't use them ([0a07b6c](https://github.com/landoftherair/lotr2/commit/0a07b6ccf5190339a40ac032bb42a2caa133fe69))
* **ui:** new character select screen! ([c67b581](https://github.com/landoftherair/lotr2/commit/c67b581fbec1b35c7121965c317791f7d3c324bc))



