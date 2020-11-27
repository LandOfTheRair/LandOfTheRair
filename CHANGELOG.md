# [1.3.0](https://github.com/landoftherair/lotr2/compare/v1.2.0...v1.3.0) (2020-11-27)


### Features

* **spells:** add spells ([d5b6b0b](https://github.com/landoftherair/lotr2/commit/d5b6b0bee97c4bde8036e0857a387b07d56e0012))



# [1.2.0](https://github.com/landoftherair/lotr2/compare/v1.1.2...v1.2.0) (2020-11-27)


### Bug Fixes

* **macro:** add color picker that works ([3cfb5e5](https://github.com/landoftherair/lotr2/commit/3cfb5e52cbfbffa811333855d9e024c62aa6d489))


### Features

* **traits:** add traits, most of them don't work but the system is in place ([b029ea2](https://github.com/landoftherair/lotr2/commit/b029ea2ed0db330878891a4f3a3632da5804bae9))



## [1.1.2](https://github.com/landoftherair/lotr2/compare/v1.1.1...v1.1.2) (2020-11-25)


### Bug Fixes

* **ai:** monsters can attack other monsters again if they're always hostile ([3833b7a](https://github.com/landoftherair/lotr2/commit/3833b7ae5c13da59cfe9bc6e56db0ea6df426e8b))
* **ui:** command line will not show if it was hidden before when relaunching game ([7d40556](https://github.com/landoftherair/lotr2/commit/7d405567d25717e8d748a917cb0c30959fa8a08c))
* **ui:** italicize miss/block messages ([3fcf167](https://github.com/landoftherair/lotr2/commit/3fcf1671d835f33650dc3e22df0dea7fa5df7504))
* **ui:** should not auto-attack npcs you aren't hostile to ([8db9f8e](https://github.com/landoftherair/lotr2/commit/8db9f8e8658ea185cb2ac820538f83cdf014c881))


### Features

* **npc:** daily items can now be bought and tracked properly ([f19c330](https://github.com/landoftherair/lotr2/commit/f19c33010a12cd5d1cba28e9388b59e2d1bdcf3c))
* **ui:** implement all options ([7dfab4a](https://github.com/landoftherair/lotr2/commit/7dfab4aaa4f7fcac96af30cc0c823142ca755f0a)), closes [#42](https://github.com/landoftherair/lotr2/issues/42)
* **ui:** sound options are added ([126477b](https://github.com/landoftherair/lotr2/commit/126477b41f26a16d91b886be476e4d117a9eb3d6)), closes [#42](https://github.com/landoftherair/lotr2/issues/42)



## [1.1.1](https://github.com/landoftherair/lotr2/compare/v1.1.0...v1.1.1) (2020-11-25)


### Bug Fixes

* **combat:** correct message sent when you die to an npc ([adb2ce7](https://github.com/landoftherair/lotr2/commit/adb2ce7d4b3bfaeb0d670c216abd090810d34d24))
* **combat:** correctly create player corpses when they die to npcs ([cc9798e](https://github.com/landoftherair/lotr2/commit/cc9798e68b3ec16471953d80b817bdc768d0e914))
* **combat:** weird setTarget issue where it would send target to defender erroneously ([fe7f1b7](https://github.com/landoftherair/lotr2/commit/fe7f1b718db0976a1424c1713bd14cb93269c518))
* **effects:** dont show swimming box. it's annoying ([b302c8c](https://github.com/landoftherair/lotr2/commit/b302c8ca965b1b860fa90e7f6c812f11ae88de43))
* **map:** horiz doors no longer have a weird fake door top sprite ([4439fc0](https://github.com/landoftherair/lotr2/commit/4439fc0ce81f37c7a8c03bd538063ba5e0840f1d))


### Features

* **ui:** add labels to scrolling boxes on side ([3b48bd1](https://github.com/landoftherair/lotr2/commit/3b48bd1279cbaa4259e36635c7fd2abc4cc0e316))
* **ui:** play sfx, bgm, cfx. closes [#31](https://github.com/landoftherair/lotr2/issues/31) closes [#32](https://github.com/landoftherair/lotr2/issues/32) ([b4daeb0](https://github.com/landoftherair/lotr2/commit/b4daeb05935daf3ed72472fbaf914f523e73b5d7))



# [1.1.0](https://github.com/landoftherair/lotr2/compare/v1.0.2...v1.1.0) (2020-11-25)


### Bug Fixes

* **npc:** green npcs now propagate their death immediately so client side isn't confused ([aaaa2ee](https://github.com/landoftherair/lotr2/commit/aaaa2ee85b1101e3a61c1c9cd0c5ec7c8fd689c7))


### Features

* **npc:** green npcs can now be killed and will always respawn after a period of time ([3f27bb2](https://github.com/landoftherair/lotr2/commit/3f27bb2e3d38f1a773377bd27fd6e464f9e0ed05))
* **targetting:** can now set/clear target server-side (commands like clear use this) ([e0eb10b](https://github.com/landoftherair/lotr2/commit/e0eb10bb1589b72019133a197f3d501489f9b32f))
* **ui:** can right click to equip or unequip or sell or use items ([fac6ec2](https://github.com/landoftherair/lotr2/commit/fac6ec2998b0d8d3dfd6492d5f6c06806fef6bff))



## [1.0.2](https://github.com/landoftherair/lotr2/compare/v1.0.1...v1.0.2) (2020-11-24)



## [1.0.1](https://github.com/landoftherair/lotr2/compare/d3aec37ce7b54cac41713922d790967a5e5ba1c8...v1.0.1) (2020-11-24)


### Reverts

* Revert "Add minimum resolution warning" ([d3aec37](https://github.com/landoftherair/lotr2/commit/d3aec37ce7b54cac41713922d790967a5e5ba1c8))



