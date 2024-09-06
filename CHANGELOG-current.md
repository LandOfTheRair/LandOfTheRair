# [2.5.0](https://github.com/landoftherair/landoftherair/compare/v2.4.0...v2.5.0) (2024-09-06)


### Bug Fixes

* **arcanist:** fix arcanist not gaining skill ([5895dd9](https://github.com/landoftherair/landoftherair/commit/5895dd93559c8e3cde9b0309a8d1ac26f04c88f0))
* **core:** fix error where you could leave a map twice if you slammed ([6407286](https://github.com/landoftherair/landoftherair/commit/64072867ec284b3776414c17e7f10b81b9ecd243))
* **core:** handle getting 'hands' items better ([0d5bfd9](https://github.com/landoftherair/landoftherair/commit/0d5bfd9ae99ec83cd21d4d5fc9bee7c815fa5b5b))
* **core:** make all unique npc spells castable again ([b2f8eaa](https://github.com/landoftherair/landoftherair/commit/b2f8eaa73259a60e495bd7ebfb5a97020652bc1d))
* **core:** remove a lot of unnecessary files with regards to new content process ([cf2d0c5](https://github.com/landoftherair/landoftherair/commit/cf2d0c58b5bf1fbdc7f468ea038285909f353552))
* **crafting:** crafting with a transferOwnerFrom item should work even if that item is in sack ([d2467f6](https://github.com/landoftherair/landoftherair/commit/d2467f62f6db12b5620a8d3deb45e9668d5106ff))
* **dice:** make internal dice less bad. they now have a better lower bound and don't completely ruin the chances of good damage ([01bf3e1](https://github.com/landoftherair/landoftherair/commit/01bf3e1bf12e27e1dd6a9fb20a12a78423c0e6e9))
* **dynamicevents:** dynamic events should not fail to init if a map failed to load ([22f7b9c](https://github.com/landoftherair/landoftherair/commit/22f7b9c6f6cb4edbfd91d2ffe7c19418ec17dfc3))
* **npc:** some npcs could have no name ([1ca34bc](https://github.com/landoftherair/landoftherair/commit/1ca34bcacdae6307ec9bab6ac3fef651a46fb7f6))
* **perf:** vortex will now only take a max of 50 items at a time ([39e0db7](https://github.com/landoftherair/landoftherair/commit/39e0db7e077550d0798b15021afd119856e66cb5))
* **spells:** static potency spells should always be rounded down ([2d62956](https://github.com/landoftherair/landoftherair/commit/2d629562a162eb5912fe08137f47acd7a750e049))
* **spells:** sweep/multistrike use the same aoe targetting mechanism as spells. spells are now hard-capped to 12 aoe targets by default ([d227653](https://github.com/landoftherair/landoftherair/commit/d2276533501ce1a98c4a214f8d327a31920b3d11))
* **stats:** fix xp/skill% ([7040e35](https://github.com/landoftherair/landoftherair/commit/7040e3532daa05e26c397397c3725ddace271a73))
* **trait:** arcane hunger now caps at 15 stacks at level 50, scales slowly along the way ([21268c1](https://github.com/landoftherair/landoftherair/commit/21268c10b74d745eec288c9097088b123e07f745))
* **world:** world loading changes should be faster, but also not stop ori/solo from getting spawners ([69ca054](https://github.com/landoftherair/landoftherair/commit/69ca05475ef1f01ea544ca9e14d793ad216ebf55))


### Features

* **class:** add a new class ([dde31a2](https://github.com/landoftherair/landoftherair/commit/dde31a26e89cc628101af0e323a0aff40946d3e1))
* **core:** can now create basic ([06d31e4](https://github.com/landoftherair/landoftherair/commit/06d31e4ae8fa6dae4f37afd79cfb4a62d9b88228))
* **core:** fix a lot of duration=-1 spells by specifying this from content editor ([3717637](https://github.com/landoftherair/landoftherair/commit/371763789c5ad717abba1715780f1ac0ff4c9ef5))
* **core:** improve handling of classes for most aspects of the game, making them more configurable ([a7f1a31](https://github.com/landoftherair/landoftherair/commit/a7f1a310aa1b36c05654011e2f789c2892585812))
* **core:** remove a lot of unnecessary spell definitions ([13defa3](https://github.com/landoftherair/landoftherair/commit/13defa3a834ff4076e21db62fd2b0ba5ec293513))
* **core:** rework base class abilities into features that can be toggled ([ddcef10](https://github.com/landoftherair/landoftherair/commit/ddcef1088388508fb968b2b748bd4f6ee5ec6ad9))
* **dx:** add content watch/build script ([540a955](https://github.com/landoftherair/landoftherair/commit/540a955cc3f450e2d298fd822702689e26f163b4))
* **gm:** add takeover command to observe npcs. closes [#343](https://github.com/landoftherair/landoftherair/issues/343) ([46d8a2b](https://github.com/landoftherair/landoftherair/commit/46d8a2b72636c139855824f2693a8ac873a53aca))
* **item:** add new effect to gain silver ([bc7cf46](https://github.com/landoftherair/landoftherair/commit/bc7cf4617e1aa20cabbc8271419d1241a656d5c8))
* **modkit:** include macicons in dist ([e2a4e42](https://github.com/landoftherair/landoftherair/commit/e2a4e4209e67822899b2417a76ffd3754630d660))
* **npc:** npcs that are alive longer give more xp - up to 400% XP for 8 hours of being alive ([a5459d8](https://github.com/landoftherair/landoftherair/commit/a5459d8d0ee0c3519af6b872a8a9df676786f613))
* **server:** add better DX for restarting server when maps change ([89eafb2](https://github.com/landoftherair/landoftherair/commit/89eafb2d02b54fdadf4093277c0e2f1ba94a7836))
* **spell:** add cleanse to remove curses, add cleanse to healer trainer ([e77d60d](https://github.com/landoftherair/landoftherair/commit/e77d60db4f82279c76b56a94ab4f05c2b1e9e9bd))
* **tooltips:** buff tooltips now support potency5 and potency10 for barnecro ([6693503](https://github.com/landoftherair/landoftherair/commit/6693503e8c676680bea6572bae22a044d1df3543))
* **trainer:** trainers now charge a bit more for their skill training. closes [#219](https://github.com/landoftherair/landoftherair/issues/219) ([13177a1](https://github.com/landoftherair/landoftherair/commit/13177a18006e819ad33be1418edbbc7491347200))
* **trait:** add arcane hunger ([be054b8](https://github.com/landoftherair/landoftherair/commit/be054b862b541008c2a020ce87f6b1627e9459f6))



