## [1.8.2](https://github.com/landoftherair/lotr2/compare/v1.8.1...v1.8.2) (2020-12-11)


### Bug Fixes

* **death:** dying didnt correctly make player sprite disappear ([fcd1512](https://github.com/landoftherair/lotr2/commit/fcd151276645737850df4352c7ab3a241d49c034))
* **map:** cannot read property sys of undefined should be gone now ([40bbb2f](https://github.com/landoftherair/lotr2/commit/40bbb2ff6b7a249a8f74cbacb175f237665f43a0))
* **teleport:** teleporting between maps is better now ([ddb931f](https://github.com/landoftherair/lotr2/commit/ddb931fd32c2e3986db675c6287f131b14310241))
* **teleport:** teleporting in any way correctly shows map at correct position without having to move ([b1d580d](https://github.com/landoftherair/lotr2/commit/b1d580d1e2239a75759c21689097d71c7ff2dfde))


### Features

* **user:** welcome new users to the game when they register ([7d4d35f](https://github.com/landoftherair/lotr2/commit/7d4d35f989caab1772a9142332fd71ec21ccb8f7))



## [1.8.1](https://github.com/landoftherair/lotr2/compare/v1.8.0...v1.8.1) (2020-12-10)


### Bug Fixes

* **death:** dying and restoring cross-map no longer leaves a corpse behind ([e80b1a2](https://github.com/landoftherair/lotr2/commit/e80b1a2c09c6334274291ae3a9d0add570e201c1))


### Features

* **combat:** weapons, ammo, and encrusts can now cast spells on targets ([0dc9934](https://github.com/landoftherair/lotr2/commit/0dc9934ba04daa5dbd25f448f9b77016499464fd))
* **npc:** npcs can spawn with random attributes ([327de2f](https://github.com/landoftherair/lotr2/commit/327de2fd8f7e37ca54506b29c1a85c51a4332cd7))



# [1.8.0](https://github.com/landoftherair/lotr2/compare/v1.7.0...v1.8.0) (2020-12-10)


### Features

* **banker:** add banks ([2ce48b5](https://github.com/landoftherair/lotr2/commit/2ce48b5d6421a0e2064f0145c6bacbf0ab7f66a6))
* **core:** add user input helper to validate numbers more simply ([6f8190f](https://github.com/landoftherair/lotr2/commit/6f8190f24ed5b7aaf16d73c655141b1e0250a32c))
* **encruster:** add encruster ([1b580f6](https://github.com/landoftherair/lotr2/commit/1b580f677d90c55073ac1869dad28dde80b1d719))
* **tanner:** tanner requires corpses be under a level ([9742ed1](https://github.com/landoftherair/lotr2/commit/9742ed13f535a35108f8d06bbe5d2ab06529eb03))
* **ui:** outline around some input fields ([7d065e2](https://github.com/landoftherair/lotr2/commit/7d065e28b794bc08696edbd8c8c0e6484198f2f0))



# [1.7.0](https://github.com/landoftherair/lotr2/compare/v1.6.0...v1.7.0) (2020-12-09)


### Bug Fixes

* **core:** better text for when you can't equip an item ([da24e34](https://github.com/landoftherair/lotr2/commit/da24e343c9972f93d78b61c0e07a34b2b30fdc86))
* **core:** no more random class undefined issues ([d5ddabe](https://github.com/landoftherair/lotr2/commit/d5ddabe34caa2487b6fe2fa1bd2b20dc79e1d55e))
* **core:** npc behaviors can now rip properties off their map extraProps instead of requiring two objects twiddled in each behavior inst ([3bbbb98](https://github.com/landoftherair/lotr2/commit/3bbbb983f621b6b4873709016cfa967149c9df2a))
* **core:** succors that aren't valid will throw an error instead of send players to NaN ([1515e8b](https://github.com/landoftherair/lotr2/commit/1515e8bbb713d60595a0a30040d083d2c173a678))
* **npc:** decrease amount of crying peddlers and tanners do ([0e17cf2](https://github.com/landoftherair/lotr2/commit/0e17cf2ab4a2dcc39b168496da624837a3d72043))
* **succor:** succor now works, and isnt blocked randomly ([709ca35](https://github.com/landoftherair/lotr2/commit/709ca35c14562ef7fe091aff4ab942435049f3ba))
* **ui:** command line should not lag while typing ([c9554c2](https://github.com/landoftherair/lotr2/commit/c9554c218d1356e33547db52be97da1f8e8f01af))
* **ui:** dropzone on map fixed ([289bacc](https://github.com/landoftherair/lotr2/commit/289bacc2a2b9023fc8c440bcf141669bce7175d2))
* **ui:** item component now displays succor info correctly ([ea72e1f](https://github.com/landoftherair/lotr2/commit/ea72e1fbe64133a1ade3a42d2e074feb28b44fc6))
* **ui:** modals with actions should not have the first one outdented slightly ([5f77d9d](https://github.com/landoftherair/lotr2/commit/5f77d9d1b5c1aae33148bfc4830a22360d0d115c))
* **ui:** specific commands can be logged now ([43fd3da](https://github.com/landoftherair/lotr2/commit/43fd3daeddac7e4cd34b1cff0da0036ded775d5e))
* **ui:** vendor info should start on the correct tab ([64a28ce](https://github.com/landoftherair/lotr2/commit/64a28ceca76f79e27fed4ef75650dcab8c54372a))
* **vendor:** vendors can no longer be accessed from across the map ([0410233](https://github.com/landoftherair/lotr2/commit/041023385bd2ba92436b352744f66aeb2464401d))


### Features

* **core:** http api functions now get access to broadcast ([f6bfe75](https://github.com/landoftherair/lotr2/commit/f6bfe7563b88c34f1a296d323460f1397c411192))
* **core:** new endpoint that can be pinged by a webhook when an update is received ([3740759](https://github.com/landoftherair/lotr2/commit/37407599f699e22e539d5a1c28343e34d5777544))
* **gm:** add gm examine item command ([79a50e5](https://github.com/landoftherair/lotr2/commit/79a50e56273754e4847d160511c7dfcf4bd5e047))
* **gm:** add gm modify item ([0784fa1](https://github.com/landoftherair/lotr2/commit/0784fa16525a64545a97e4f2c8b41fcd817ee47c))
* **item:** items can be destroyed on drop now ([e0c3b6f](https://github.com/landoftherair/lotr2/commit/e0c3b6f02724d674cf5bca1f6942d489aaab91e2))
* **item:** succor on drop ([9dfcc33](https://github.com/landoftherair/lotr2/commit/9dfcc33b769ae460b0d0e11e7671b4f3fddf06ba))
* **npc:** add alchemist npc ([ca3a9db](https://github.com/landoftherair/lotr2/commit/ca3a9db2901ba7a2584e442a21612d72300ffba9))
* **npc:** add smith npc ([6d98da1](https://github.com/landoftherair/lotr2/commit/6d98da1d56a3ac61e23aad8503c5f8365ecc7ae1))
* **npc:** add succor tree npc ([85f72cd](https://github.com/landoftherair/lotr2/commit/85f72cd7b6d7014067757bbe9c67b9f4275afd1d))



# [1.6.0](https://github.com/landoftherair/lotr2/compare/v1.5.4...v1.6.0) (2020-12-08)


### Bug Fixes

* **build:** when running client locally with assets symlinked, client will no longer update every time you change a small thing in content ([442d8e3](https://github.com/landoftherair/lotr2/commit/442d8e35ef47ca0d59aa34ff7a6b26aebeff1058))
* **macro:** macro bar editor shows tooltips ([ec14337](https://github.com/landoftherair/lotr2/commit/ec14337ec07d35582e7738ae2a7daf7480acec79))
* **newchar:** hp.minimum should be 0, not 100 ([464fe07](https://github.com/landoftherair/lotr2/commit/464fe07c9e1680e9ddfdc203e686a629a2bf97dd))
* **trainer:** join dialog should have more descriptive options ([05c383f](https://github.com/landoftherair/lotr2/commit/05c383f5a1e58237d949957940b6a27267e37721))
* **trainer:** undecided's can level up now ([1fa5ed7](https://github.com/landoftherair/lotr2/commit/1fa5ed7c4ef867f6c4ac9827898bd8ab5ef8ae42))


### Features

* **create:** creating a char now gives you a default skill and sets up your macro bar to have those skill(s) ([ed0975f](https://github.com/landoftherair/lotr2/commit/ed0975ff2d4d9e7594a7d1d63f327231c9c37167))
* **identifier:** add new identifier npc ([5f86bad](https://github.com/landoftherair/lotr2/commit/5f86bad3276a04f8607cb0b37beec75ed65933a6))
* **peddler:** add peddler npcs/script ([63024f3](https://github.com/landoftherair/lotr2/commit/63024f32a5c9b468d3951a300b72ebeeee6f198e))
* **stats:** add unique stat/skill triangles for each allegiance ([5aaf24a](https://github.com/landoftherair/lotr2/commit/5aaf24a7f7ef887d1b4d5c76a4f54328675fef43))
* **steal:** steal now moves towards targets, and doesnt require being hidden. npcs start with thievery skill to thwart thieves ([8283273](https://github.com/landoftherair/lotr2/commit/82832734b1243d9899cd0b29712c94e0d5a20156))
* **tanner:** add tanner ([14ce9a1](https://github.com/landoftherair/lotr2/commit/14ce9a1bca2c3054a8163417403d335f600a7396))
* **thief:** add mug ([6ad6f3c](https://github.com/landoftherair/lotr2/commit/6ad6f3c94b8b7a1daaa222f6ba8063eb18225ee5))
* **tutorial:** leaving tutorial will set respawn point to rylt ([5d3eabd](https://github.com/landoftherair/lotr2/commit/5d3eabdac7e9a33b007a8e3b1ee77648951defa0))



## [1.5.4](https://github.com/landoftherair/lotr2/compare/v1.5.3...v1.5.4) (2020-12-06)


### Bug Fixes

* **core:** invalid vendor items should log, not throw ([edd0b8a](https://github.com/landoftherair/lotr2/commit/edd0b8a055bc86aad761391fb6ef4de7946a3f15))
* **death:** dying no longer leaves you in an infinite loop when respawning ([252afea](https://github.com/landoftherair/lotr2/commit/252afeacae9623c91b0adf7184b65163c5b034dd))
* **map:** fix map reloading when quitting and rejoining game ([6a3765d](https://github.com/landoftherair/lotr2/commit/6a3765d027ce450c0e8bb65b21356d55b9baca6c))
* **map:** hopefully fix race condition when creating sprites ([301aa49](https://github.com/landoftherair/lotr2/commit/301aa496afc70dd5e824af2dad7d8a95ac1c3210))
* **npc:** natural resources should not crash the game when you see them ([1791a37](https://github.com/landoftherair/lotr2/commit/1791a37113facd9d9a71c5bfb4e7917245a14068))
* **npc:** npcs will now get random names correctly, when appropriate ([86123bc](https://github.com/landoftherair/lotr2/commit/86123bc81acf2a2ed765544e945cdb1902586f02))
* **spawner:** holiday spawners should only spawn on holidays ([6fd72d8](https://github.com/landoftherair/lotr2/commit/6fd72d8e9d2785abb8d463b44c8b5f85f7bfbcb3))
* **ui:** active target should move dangerous marker to right side ([f8d2919](https://github.com/landoftherair/lotr2/commit/f8d29190446404994255ab5d5aafa296006cdda3))
* **ui:** put command line back in correct position ([b4e9f41](https://github.com/landoftherair/lotr2/commit/b4e9f413851f7ccca9459873e9bf41cebb5b0580))
* **ui:** vendor ui should scale better for people with more currency ([6f78b97](https://github.com/landoftherair/lotr2/commit/6f78b9707e90d8abbc6fa45e280f4827d984daaa))
* **ui:** vendor window was too short ([3d8aa0f](https://github.com/landoftherair/lotr2/commit/3d8aa0f83ecbb725a105e3b8a117a928fc9a5b75))



## [1.5.3](https://github.com/landoftherair/lotr2/compare/v1.5.2...v1.5.3) (2020-12-05)


### Bug Fixes

* **npc:** npc names that are static are 99% likely to be first, 1% to be random ([5d1039b](https://github.com/landoftherair/lotr2/commit/5d1039b643b324f53dbffb7efd0011e8b3aa8c13))


### Features

* **ui:** hide map while transitioning between maps ([1bec460](https://github.com/landoftherair/lotr2/commit/1bec460459e2d3a25799036ae29928d5a412f87c))



## [1.5.2](https://github.com/landoftherair/lotr2/compare/v1.5.1...v1.5.2) (2020-12-05)


### Bug Fixes

* **map:** hopefully fix 'cannot read property sys of undefined' ([2a557c7](https://github.com/landoftherair/lotr2/commit/2a557c7c5c0b61357f4f433bd107367175aa79b6))
* **swimming:** swimming in lava immediately does fire damage ([425f5cc](https://github.com/landoftherair/lotr2/commit/425f5cc1a23d18c8a2b08595f8397b2f5dcc0cd1))
* **targetui:** target ui would jitter when stepping on and off of a targets tile ([aca7c02](https://github.com/landoftherair/lotr2/commit/aca7c023904d1cdb312fa869a0576492ca71c86f))


### Features

* **gm:** add gm teleport, add gm command logging ([466d0c7](https://github.com/landoftherair/lotr2/commit/466d0c7d475c5b3a7095350d49af23ceb4561eb9))
* **options:** reorg options, add new debug ui option ([b0cd1a7](https://github.com/landoftherair/lotr2/commit/b0cd1a7c0d42172e2b197c185a6a280da7a37ee9))
* **world:** can transition between two maps properly now ([22d97bd](https://github.com/landoftherair/lotr2/commit/22d97bd3d3d3b4e9e77b30433397e6cec4b71690))



## [1.5.1](https://github.com/landoftherair/lotr2/compare/v1.5.0...v1.5.1) (2020-12-04)


### Features

* **spells:** add heal, heal infra, ignore cfx on self casts for heal ([fc6945f](https://github.com/landoftherair/lotr2/commit/fc6945f7af6d1a0173cc07dd1df45eb25b534344))



# [1.5.0](https://github.com/landoftherair/lotr2/compare/v1.4.0...v1.5.0) (2020-12-04)


### Bug Fixes

* **death:** fix dropping left hand and emptying right hand ([65f9578](https://github.com/landoftherair/lotr2/commit/65f9578bec6c7b264a91714486ce63ebc211fdad))
* **messages:** somebody was killed by somebody fix ([aa3b490](https://github.com/landoftherair/lotr2/commit/aa3b490db879243ef07925b470eb33d15430b622))
* **npc:** npcs now correctly get a level assigned ([6aa6263](https://github.com/landoftherair/lotr2/commit/6aa62635dcf121ce2b7ebd043a4551a999e3bd4f))
* **ui:** two tooltips on skill window ([5827122](https://github.com/landoftherair/lotr2/commit/5827122ec28c680a2fe1c74af4c9783edaaf58cf))


### Features

* **caster:** add clearcasting trait ([0325641](https://github.com/landoftherair/lotr2/commit/032564195b653ff46823073a2e9cd17cf09c6e98))
* **combat:** can now kick ([ec55ead](https://github.com/landoftherair/lotr2/commit/ec55ead3e0e02f613597a772944a203998f0e7e5))
* **combat:** can now throw items ([9e79191](https://github.com/landoftherair/lotr2/commit/9e7919151152ed263106ab332ab20360b929c09d))
* **npc:** clear agro on npc kill ([a9ecdf6](https://github.com/landoftherair/lotr2/commit/a9ecdf61f452cec50f93fe1e545acf8997247c12))
* **npc:** green npcs can wander around optionally, and will fight back if attacked ([ebe3816](https://github.com/landoftherair/lotr2/commit/ebe3816489ac9dec89f3d0826ae8ec549e6a9a00))
* **npc:** green npcs will fight back, move to you, cast spells at you, and can have hp, mp, and levels ([a0445a6](https://github.com/landoftherair/lotr2/commit/a0445a69f13bc14c6bfab24bcedad098be4da768))
* **npc:** spawn and leash messages/sfx ([fffc7b5](https://github.com/landoftherair/lotr2/commit/fffc7b550f62b96839a52c3a675fa7a6f014e5b2))
* **warrior:** add swashbuckler trait ([94c2a70](https://github.com/landoftherair/lotr2/commit/94c2a70ef49e2fb3662d8102dee272b80a8a2367))



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



