# [1.4.0](https://github.com/landoftherair/lotr2/compare/v1.3.4...v1.4.0) (2020-12-03)


### Features

* **npc:** npcs can generate with a random, specific name with some nostalgic names already added ([a31387d](https://github.com/landoftherair/lotr2/commit/a31387d85e2c4bb8491e7bea0209ba8237292a53))
* **warrior:** new macro mode autoTarget, new warrior skill Cleave ([a656eb3](https://github.com/landoftherair/lotr2/commit/a656eb35437fa42f1939093532dd4f816275f3cd))



## [1.3.4](https://github.com/landoftherair/lotr2/compare/v1.3.3...v1.3.4) (2020-12-02)


### Bug Fixes

* **macro:** don't throw error if a spell doesn't exist ([485231e](https://github.com/landoftherair/lotr2/commit/485231efd9340eeae406a44ea648bb148e2e60bf))
* **ui:** macro bar click popover for setting bars tweaked to be slightly better ([23225af](https://github.com/landoftherair/lotr2/commit/23225af38cd52f3e2c1a4167ca2b3cefb0513008))


### Features

* **thief:** basic stealth shenanigans work, weapons detract stealth not by percent anymore, stealth/perception simplified significantly, do not send hidden chars to client anymore, filter out beforehand ([59c8b74](https://github.com/landoftherair/lotr2/commit/59c8b745d46594ba180cc0bad95f1798c4caa386))
* **thief:** stealing, lots of stealing, stealing traits ([c0def12](https://github.com/landoftherair/lotr2/commit/c0def12b6bf565c8679934ef226351eb36d22089))
* **thief:** thief stealth bar goes down based on num hostiles nearby, trait to reduce ([b261d62](https://github.com/landoftherair/lotr2/commit/b261d6255f5911f4c17c73fd98c66131f417954a))
* **ui:** move target so it doesnt cover armor ([6a2f3b8](https://github.com/landoftherair/lotr2/commit/6a2f3b8469fd11f19b6398e71bf62392a7b4b5b6))



## [1.3.3](https://github.com/landoftherair/lotr2/compare/v1.3.2...v1.3.3) (2020-11-30)


### Bug Fixes

* **combat:** auto attack would send too many inputs over time, causing issues ([d7cc934](https://github.com/landoftherair/lotr2/commit/d7cc93410099572317fdab74988c836c2248031c))


### Features

* **character:** all characters regen on a 5 second tick instead of 1 second ([e867a4c](https://github.com/landoftherair/lotr2/commit/e867a4cd9fcb4780e086a429eb121fbdc5d19798))
* **combat:** not seeing someone removes them as an active target ([86480a5](https://github.com/landoftherair/lotr2/commit/86480a5e21c01663cc1b5466f857207826af6892))
* **core:** actions are now queued client-side and flushed every 100ms. there is a server side limit of 5 commands per 100ms or subsequent commands get dropped ([4186085](https://github.com/landoftherair/lotr2/commit/4186085942481f84486ff7cd9ec9308be7da1d62))
* **macros:** learning new macros will allow you to select bars to put them into ([1f40041](https://github.com/landoftherair/lotr2/commit/1f40041e5d6fab52931dcb567e13710d575b4401))
* **vendor:** show how much currency you have to spend in vendor window ([176e909](https://github.com/landoftherair/lotr2/commit/176e90932355e5e0ed9e759e928252265c891119))



## [1.3.2](https://github.com/landoftherair/lotr2/compare/v1.3.1...v1.3.2) (2020-11-29)


### Bug Fixes

* **combat:** add agro any time damage is taken ([38e8d78](https://github.com/landoftherair/lotr2/commit/38e8d782ad7c7aa63f49c60abbae3d80c20dd2bf))
* **combat:** boost by magic boost stat ([47a203f](https://github.com/landoftherair/lotr2/commit/47a203f2ad062c2b4f738da7df3fe2b5cf15fa2b))
* **spells:** spells would cast without consuming item charges, and spells cost no mana ([74b2244](https://github.com/landoftherair/lotr2/commit/74b2244e185329ce034feaf8d5b7e08359feea8f))
* **ui:** click-to-cast spells work correctly when clicking npc box now ([818cac6](https://github.com/landoftherair/lotr2/commit/818cac6cd5284a9c261480ea47a1f6c38b7bc840))


### Features

* **macro:** add ignore auto attack checkbox back to macro screen ([7cc5579](https://github.com/landoftherair/lotr2/commit/7cc5579eae0c722b2742b3fd0cf0e5464d5716f7))
* **macro:** macros can support a pragma that can be assigned. linking a macro will let it display cooldowns ([1da469a](https://github.com/landoftherair/lotr2/commit/1da469a2d0cd3410eeb698daf052f186b0fd104f))
* **macros:** learned macros do not share between characters ([725f651](https://github.com/landoftherair/lotr2/commit/725f651c7a60e41bb208748871b9f62e0d353684))
* **macros:** you get prompted to create new macros now ([69132e5](https://github.com/landoftherair/lotr2/commit/69132e562f96e1915999ba9a927f60e782405b4f))
* **spell:** spells can be channeled now ([077ec77](https://github.com/landoftherair/lotr2/commit/077ec77f0bf75d5a8caee1642fed1431e9b7890e))
* **trait:** add careful touch ([5757e90](https://github.com/landoftherair/lotr2/commit/5757e9050272a6876b0573f47190127d96595fba))
* **trait:** death grip implemented. green npcs never drop their hands. ([f536173](https://github.com/landoftherair/lotr2/commit/f5361731ea57a4bfde2e6179fa0cfb1d150c85e8))



## [1.3.1](https://github.com/landoftherair/lotr2/compare/v1.3.0...v1.3.1) (2020-11-27)


### Features

* **spells:** wil saves are in, different from before ([9a2301c](https://github.com/landoftherair/lotr2/commit/9a2301cf545d7c9ad4634eba9b597ec2e475ca99))



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



