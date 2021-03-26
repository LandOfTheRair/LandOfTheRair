## [1.12.1](https://github.com/landoftherair/lotr2/compare/v1.12.0...v1.12.1) (2021-03-26)


### Bug Fixes

* **core:** check for player before doing a ground update ([b0d692a](https://github.com/landoftherair/lotr2/commit/b0d692af11301cef80d8d71cd148c064fe02cd97))
* **core:** dont halt on effect not found, just log and dont add it ([997eac4](https://github.com/landoftherair/lotr2/commit/997eac4957faa50622d18a777871752750da1c1a))
* **core:** fix npcs with attributes causing a break when they died ([1bd6030](https://github.com/landoftherair/lotr2/commit/1bd603093b6936d9c41fb7263e64b0d7082d5782))
* **core:** properly migrate material storage for players ([e58a08e](https://github.com/landoftherair/lotr2/commit/e58a08ec5ef8bd8565e8782354a6d4eb4625e840))
* **effect:** mood would force stat recalculation too often ([0b2d9b7](https://github.com/landoftherair/lotr2/commit/0b2d9b7b3a0a44aa1ce4c821e56c91e70c8954c7))
* **effects:** effects should now correctly clear on death ([0aa72c5](https://github.com/landoftherair/lotr2/commit/0aa72c59f65bf9d0c2bab5f9d610a82217ae4541))
* **locker:** can no longer attempt to withdraw items you don't have from material storage ([e5fd756](https://github.com/landoftherair/lotr2/commit/e5fd756bcb52c5f4e84fb48d72232cc4c84bc00c))
* **npc:** green npcs did not properly have an xpGive set for when they died ([b441d11](https://github.com/landoftherair/lotr2/commit/b441d114421c203ed791d63015b9c4147c748c52))
* **npc:** npcs have skill on kill set correctly ([1413d12](https://github.com/landoftherair/lotr2/commit/1413d1248edb0433abe8d2fb30e54e3c287016b6))
* **register:** registration process would not work due to premium changes ([bbf58d1](https://github.com/landoftherair/lotr2/commit/bbf58d18101f97128a661d72d055cb60bef81797))
* **trait:** you only get 1 trait point per level now ([9e7b577](https://github.com/landoftherair/lotr2/commit/9e7b577078428e018e4c69cad970dff74a2fcb25))


### Features

* **cmd:** add charge, anyone can buy charge ([c62e1c6](https://github.com/landoftherair/lotr2/commit/c62e1c6459df8b9fa544218c33df41156f92351f))
* **core:** fix reboot routes to make more sense ([eda5459](https://github.com/landoftherair/lotr2/commit/eda5459a32993c6d8efd1ac2cd331e9b19b7c6d7))
* **spell:** add Aid ([997beac](https://github.com/landoftherair/lotr2/commit/997beace35885d9c8aca63dabea1bb31a2337eca))
* **spell:** add barnecro, barfrost, barfire, barwater ([e03c68c](https://github.com/landoftherair/lotr2/commit/e03c68c226671fded82e13cf021a54bdeaa503a3))
* **spell:** add combust/hail ([ad4bf5c](https://github.com/landoftherair/lotr2/commit/ad4bf5ccd78de266b1602674e7f37c1e1eff9a85))
* **spell:** add conjure healing ([cb4982d](https://github.com/landoftherair/lotr2/commit/cb4982d94af3829bdc13f6b916f07f38b3bdeead))
* **spell:** add daze ([3c5bae4](https://github.com/landoftherair/lotr2/commit/3c5bae43857f5c60600844dfb00b365604c3432c))
* **spell:** add disease ([c83e7d5](https://github.com/landoftherair/lotr2/commit/c83e7d56edaa39a21f451ac062b289a8197051c8))
* **spell:** add eagleeye ([149ba3e](https://github.com/landoftherair/lotr2/commit/149ba3e9d2189877a27dc5a07da296f2e9ce70ac))
* **spell:** add haste, protection, absorption ([262e567](https://github.com/landoftherair/lotr2/commit/262e5678c50bb45e0752c4ccb2eda55a32293d65))
* **spell:** add regen ([5f76f76](https://github.com/landoftherair/lotr2/commit/5f76f7643af07ceca21396a929c7798740d212b0))
* **spell:** add secondwind ([a403d8c](https://github.com/landoftherair/lotr2/commit/a403d8c932c0ad0f51227390ed2231406f8e77f3))
* **spell:** add snare ([dbdb86d](https://github.com/landoftherair/lotr2/commit/dbdb86d5fe835152398ca624e80bfdd9358a0d8e))
* **spell:** add succor spell ([9da6887](https://github.com/landoftherair/lotr2/commit/9da6887c85dbabfae308b7911a71259e9e334f2b))
* **spell:** add wellspring ([445a0f1](https://github.com/landoftherair/lotr2/commit/445a0f17f0b2ae9f351e883b839ce3a5dde80e02))
* **spell:** spells can now arbitrarily give bonus agro (useful for debuffs) ([ea6b9f7](https://github.com/landoftherair/lotr2/commit/ea6b9f79e405e2328ffc2d5015a00131908d98ac))



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



# [1.11.0](https://github.com/landoftherair/lotr2/compare/v1.10.3...v1.11.0) (2021-03-12)


### Bug Fixes

* **break:** can only break items you own ([3607cbe](https://github.com/landoftherair/lotr2/commit/3607cbe2c8dd75648f59cb4724aac525ec209ea5))
* **combat:** remove ooc regen (for now) ([7f48c6d](https://github.com/landoftherair/lotr2/commit/7f48c6d0fe214e306212b48071e7f21c07e9ba97))
* **locker:** lockers would not show correctly if you had never visited the current one before ([e9f4437](https://github.com/landoftherair/lotr2/commit/e9f443771e2b54a85299e81f78c4d7d973f74773))
* **macro:** ignore auto attack macros would still fire in some weird situations ([8c0fe57](https://github.com/landoftherair/lotr2/commit/8c0fe5744824e842131d5317236629c52ef80c70))
* **macro:** macros would not immediately show up in selector after creation ([b0e270a](https://github.com/landoftherair/lotr2/commit/b0e270a26aae4a2a070bc0ad2c31421a1cfedf67))
* **spell:** poison gives xp on kill, flags hostiles correctly as a dot ([14f80f7](https://github.com/landoftherair/lotr2/commit/14f80f742bfb435ceb120a6d4117e67cdbc6f934))
* **spell:** poison should do poison damage, not necrotic ([783da3d](https://github.com/landoftherair/lotr2/commit/783da3da2151bbfa9888ce4e82b31cc4513b22d5))
* **spell:** spells no longer allow you to cast non-unique multiple times against the same target as the same caster. multiple unique casters will still stack ([105cf38](https://github.com/landoftherair/lotr2/commit/105cf38b0538707586bc36994b92316e916bbd83))
* **ui:** trainer would not let level ups happen ([3b09d5d](https://github.com/landoftherair/lotr2/commit/3b09d5d7c1bfbff90d75ed435f8c884a652e54ea))


### Features

* **character:** mages and healers now start with skill 1 of their respective caster skills ([2aca43f](https://github.com/landoftherair/lotr2/commit/2aca43f562c88a4dc260606cfab89a6197e35800))
* **combat:** luck now contributes minorly to ensuring crit hits ([17174f4](https://github.com/landoftherair/lotr2/commit/17174f41e91126dc459df525decfe0b5d5d8f8c0))
* **combat:** when out of combat, you will regen 25% hp/mp per tick ([e61b3bf](https://github.com/landoftherair/lotr2/commit/e61b3bff348178a0b26569bf174f0f44c4617742))
* **core:** gain 1 xp per kill if you surpass map cap so you have a better indicator of when to move on ([5c8eddb](https://github.com/landoftherair/lotr2/commit/5c8eddb4c8496a48c33864718a6705b7c3364fc5))
* **core:** kick and save all players when updating game automatically; add kick command to kick people ([e16a305](https://github.com/landoftherair/lotr2/commit/e16a3058f3426bfb4d47b12aafeb353b8a072a4b))
* **core:** reboot notifications go to discord. notification on complete update as well ([8a7611f](https://github.com/landoftherair/lotr2/commit/8a7611f483edaa170b76715c8cd3fe0c0add8055))
* **locker:** add lockers. still needs some testing, but should work alright ([0e88d35](https://github.com/landoftherair/lotr2/commit/0e88d35c019b1c0b4350ac030972597d56068357))
* **locker:** re-add material storage. add deposit all button. ([af375e3](https://github.com/landoftherair/lotr2/commit/af375e39ff39024dd12894659c67e7adc2c92099))
* **npc:** npcs now have subgroups that stop them from infighting even if they are Hostility.Always. Allegiance.Enemy will no longer prevent infighting. ([06d9968](https://github.com/landoftherair/lotr2/commit/06d9968811aa3957a3288a1ec6637b0541a5dba8))
* **npc:** npcs without a path or target will now move a max of 1 space at a time, to prevent them from being too unwieldy ([4c45ebe](https://github.com/landoftherair/lotr2/commit/4c45ebe670d8705f1ea8e55c3cee90d695e885a9))
* **runes:** rune scrolls come back in this exciting new feature. a codex slot opens up every 5 levels, and you can learn/reinscribe rune scrolls any time (except in combat). you cannot duplicate them anymore, but you can stack different tiers together. ([2cb427c](https://github.com/landoftherair/lotr2/commit/2cb427cc8709b8b95ae2b23f20c9d721e4db14ae))
* **trainer:** when skill training, you can only spend as much coin as would get you to the max skill level of the trainer ([30914c1](https://github.com/landoftherair/lotr2/commit/30914c110d9f3ac4f04ba0d3d9dd5a87dcc81c7a))
* **trainer:** when skill training, you now gain xp at a rate of 1/10th of the gold spent ([92b5ac3](https://github.com/landoftherair/lotr2/commit/92b5ac3977db08bb16b3f194ca6a7485c168ec24))



## [1.10.3](https://github.com/landoftherair/lotr2/compare/v1.10.2...v1.10.3) (2021-03-08)


### Bug Fixes

* **combat:** crit fail/success are now more detrimental/valuable ([6d14120](https://github.com/landoftherair/lotr2/commit/6d14120cfc2608d91557c975a220c78152ec41ef))
* **combat:** melee combat was significantly overhauled ([a42f13e](https://github.com/landoftherair/lotr2/commit/a42f13e475a8a529606786fba641af00e7afe674))
* **content:** move skill descs to content because it belongs there ([2536eea](https://github.com/landoftherair/lotr2/commit/2536eea37a52e97229fad4dd2d56482b9acf76a6))
* **core:** fix debug routes ([3f12434](https://github.com/landoftherair/lotr2/commit/3f124342aee8830e254de003b427cf0799cacc7d))
* **ui:** improve movement speed/general fast queue action speed ([1251acc](https://github.com/landoftherair/lotr2/commit/1251acc84db965031ae6c2ec508601a36d1f271c))
* **ui:** you dont see that person clears the queue of that person so it doesnt keep going ([50da094](https://github.com/landoftherair/lotr2/commit/50da0943a8015a277c2f6771b69e8fec66eb4ab3))


### Features

* **combat:** add small bonus damage per skill for weapons ([ad72a8b](https://github.com/landoftherair/lotr2/commit/ad72a8be43a7f0b4bc5e8f898eb62e39c57e0d66))
* **combat:** combat rebalance spells now add bonus damage rolls for spells. dd spells (afflict, mm, mb) affected for now ([4a66338](https://github.com/landoftherair/lotr2/commit/4a663380c5e7fcf271eb62daa5f2b7d05cdc8439))
* **thief:** add reveal command to break stealth ([b87f25b](https://github.com/landoftherair/lotr2/commit/b87f25bd905406387da492cd6d976c753b21f5ec))
* **trainer:** trainers will now let you train your skills by holding coins and asking them to train. training will consume gold at a 1:1 rate until you run out of training, and will double your skill gain while you have training ([0b4d408](https://github.com/landoftherair/lotr2/commit/0b4d408b461d92892f8573f7190ddd8f40362532))
* **ui:** can now right click another player to view their equipment ([62abbbf](https://github.com/landoftherair/lotr2/commit/62abbbfd06860e62c27cf0e9d6a01e8a6795d466))



## [1.10.2](https://github.com/landoftherair/lotr2/compare/v1.10.1...v1.10.2) (2021-03-05)


### Bug Fixes

* **chat:** announcements from system would erroneously be labeled from discord in some cases ([926dc13](https://github.com/landoftherair/lotr2/commit/926dc134865478e1829c6eba33f05364845e23b8))
* **creator:** char create will no longer close on a click outside or esc ([596c8b4](https://github.com/landoftherair/lotr2/commit/596c8b4444bc69936e59e483ba22bd18993b3469))
* **discord:** discord will no longer double post new joiners ([ccf6e6e](https://github.com/landoftherair/lotr2/commit/ccf6e6ef5fca9fcd8b234950db6d5d564703613d))


### Features

* **item:** items can be heavy again. all breastplates and fullplates are heavy. heavy items inflict encumber. thieves and mages can be encumbered. encumberance now affects stealth too ([450977d](https://github.com/landoftherair/lotr2/commit/450977d449e01004cece83bc13b0cf01556cfb47))
* **lobby:** character creator now shows stat deltas on class/allegiance & lets you pick a weapon spec from the start ([030c88e](https://github.com/landoftherair/lotr2/commit/030c88ea1d0f7bcf0987a4454a1594ef04e87350))
* **quests:** add daily quests ([bed67f9](https://github.com/landoftherair/lotr2/commit/bed67f912cb6b1e23427a6a05a0f8970d80d8125))
* **ui:** new drag/drop/multiselect capabilities - ctrl click equipment, sack, belt to select stuff ([8712cb5](https://github.com/landoftherair/lotr2/commit/8712cb51e4147b0478c03dbf0c8d077db43977bb))
* **ui:** new option to shrink character boxes down to name+health ([76d053b](https://github.com/landoftherair/lotr2/commit/76d053bebff84586d728155989f4ed07125ae14a))
* **ui:** remove jank from character create modal ([5d70eb1](https://github.com/landoftherair/lotr2/commit/5d70eb18eb981d1e9258e67ec2167f33acc4e1bf))
* **ui:** show character and item when in character create ([32fd8e8](https://github.com/landoftherair/lotr2/commit/32fd8e8032d90c9f33bd647fc958abb9d3e3f30a))
* **ui:** when game is getting updated, send a notification to let players know that an update is incoming ([2fdbf64](https://github.com/landoftherair/lotr2/commit/2fdbf64b4585c273c618d78efd99f280198827dc))



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



# [1.10.0](https://github.com/landoftherair/lotr2/compare/v1.9.1...v1.10.0) (2021-02-26)


### Bug Fixes

* **ai:** leash message should say "you hear" ([bd83358](https://github.com/landoftherair/lotr2/commit/bd8335821bd0a0c06ed272e44f6fb61d08ca7c01))
* **client:** fix items having traits that dont exist yet ([d8285b2](https://github.com/landoftherair/lotr2/commit/d8285b22723a0357d739390e7f99371bf81a33ad))
* **combat:** ranged weapons work correctly for their range ([1a20bb9](https://github.com/landoftherair/lotr2/commit/1a20bb933dcd82ebcd7ff446213eb9b9fcd2a8f5))
* **combat:** you can no longer have spells cast on you whilst dead, so you cant get poisoned while dead anymore ([3d2f5b4](https://github.com/landoftherair/lotr2/commit/3d2f5b4267c445f1c785ab8146167d28f30bae22))
* **core:** fix issue where sometimes people dont have a state ([5f6c8f4](https://github.com/landoftherair/lotr2/commit/5f6c8f4008092ad151695eacaf954edde1b7128c))
* **core:** websocket close error code was invalid when disconnecting a user logging in from multiple locations ([7b0ee64](https://github.com/landoftherair/lotr2/commit/7b0ee6426e78c6091833d5c077c2089182a8e32a))
* **debug:** debugging should only trigger for commands that need it ([85a49c6](https://github.com/landoftherair/lotr2/commit/85a49c6c93ce5888701d1aa5925d4f1fe1d3b4df))
* **door:** opening a door and not moving updates the player FOV ([e8d9b35](https://github.com/landoftherair/lotr2/commit/e8d9b352a80064dca1ae4406542dc8cf450aa7a1))
* **drops:** rejigger drop rates so luck bonus only applies to certain things instead of everything globally ([fd7f48a](https://github.com/landoftherair/lotr2/commit/fd7f48aca874d9524d72c6aa5f3e9005ad917142))
* **ground:** items on ground that were technically dupes were decrementing count twice, removing them erroneously when moving to equipment slots ([e3aa5aa](https://github.com/landoftherair/lotr2/commit/e3aa5aad8e7802e7ea6f6e2a21c782b596fff3e4))
* **player:** attacking while stealthed always gives additional thievery skill ([2a932d3](https://github.com/landoftherair/lotr2/commit/2a932d3fd53ba4c2bf611568598acef0677cd635))
* **player:** dropping a succor blob from sack or hands should properly dispose of it if needed ([5d3fc8c](https://github.com/landoftherair/lotr2/commit/5d3fc8cce66c866a97c0739573ced345a2ca85fe))
* **player:** players would not gain fractional amounts of skill, which they should be able to - fixes dagger/throwing ([51f502d](https://github.com/landoftherair/lotr2/commit/51f502dfbca95704aeed4ea5548a347d08eb33b3))
* **quest:** fix being able to turn in kill quests immediately upon receiving them ([37bc63c](https://github.com/landoftherair/lotr2/commit/37bc63c94a7360462f9581e339b6a978e27f1941))
* **quest:** fix ownership checks of quests ([f42dfdf](https://github.com/landoftherair/lotr2/commit/f42dfdfc48aa3dc1e30305109cff43cd66220849))
* **register:** register no longer lets you register as someone else who has already registered ([6887b25](https://github.com/landoftherair/lotr2/commit/6887b25cd9523ff360d87a767f3155664653c830)), closes [#61](https://github.com/landoftherair/lotr2/issues/61)
* **server:** crash when accessing a player state that doesnt exist ([8984907](https://github.com/landoftherair/lotr2/commit/898490762f656d77d0817e10eea3908aa6199d36))
* **spawner:** lair spawners sometimes got the wrong data and overrode each other ([f6e9cdd](https://github.com/landoftherair/lotr2/commit/f6e9cddefa939e3309f22236a8eb4ce455072bab))
* **spells:** logging in to a new character that knew spells no longer prompts you to learn them if they exist on a bar (such as rolling a mage or healer would) ([50a5677](https://github.com/landoftherair/lotr2/commit/50a56771a9f666e205d8789cbe1ef81ede40eb44))
* **steal:** NPCs should only be able to steal on your tile ([818f6bc](https://github.com/landoftherair/lotr2/commit/818f6bc4c1313502f19e05d8cce049d99a2b897e))
* **stealth:** thief stealth bar only drains when there are hostiles that can see your position ([3fd15c7](https://github.com/landoftherair/lotr2/commit/3fd15c7491041bed79556f9a5333bd2959090747))
* **succor:** refactor succor so it always generates the same ([adfb9bc](https://github.com/landoftherair/lotr2/commit/adfb9bc2f278b74f8a8461abfc7de3f808b687ae))
* **ui:** allow for un-activing of macro bar again ([6f647b9](https://github.com/landoftherair/lotr2/commit/6f647b948498ee7522015a94a96977d13a335a6a))
* **ui:** book now shows current/total pages ([a03baf4](https://github.com/landoftherair/lotr2/commit/a03baf4746bac71e68a383e7421252bbeedc8609))
* **ui:** can move equipment window around again ([ca8d357](https://github.com/landoftherair/lotr2/commit/ca8d3574bcf2e0ffea68d3c86bf82b9390e1d30f))
* **ui:** default selected tab for quests; fix windows showing content while not visible ([6249b30](https://github.com/landoftherair/lotr2/commit/6249b300ab58b8f10ab812ff462c33ef34b3a7d2))
* **ui:** display default 'you have no x quests' for empty quest screen ([efa7e27](https://github.com/landoftherair/lotr2/commit/efa7e27c919be8e23981e79bc127cf4c13a743f5))
* **ui:** dont show 'welcome to' message when changing maps, only when entering ([3f237c2](https://github.com/landoftherair/lotr2/commit/3f237c262bdd3b77c40890cfc2a038a89642f724))
* **ui:** fix macro bar adding popup closing a lot ([3e45332](https://github.com/landoftherair/lotr2/commit/3e4533259ba24aa236794ec2d9275d8bb36022e9))
* **ui:** lobby messages should always start in the same spot after the timestamp ([141d464](https://github.com/landoftherair/lotr2/commit/141d46424c6bc312b266449d898671a5d4e02b25))
* **ui:** lobby messages should break-word, not break-all ([586e8ff](https://github.com/landoftherair/lotr2/commit/586e8ffcbdd96993b6f5771302cd7cc4d906b84a))
* **ui:** macro bars should by default be 64px tall even if there's nothing to display ([ec90804](https://github.com/landoftherair/lotr2/commit/ec908045b2a4fb59841fc9588ed43396767a9745))
* **ui:** moving map around while in game would cause clicks to be off for movement ([ca3ab24](https://github.com/landoftherair/lotr2/commit/ca3ab24c8b6c73aa26529e3e8ae3f42e87ba9682))
* **ui:** npc window is default 3 wide, spacing for scrollbar ([c75d880](https://github.com/landoftherair/lotr2/commit/c75d880db02a3ddc18d87fad17c43f125d8cd1b4))
* **ui:** show multiple macro bars at once again ([873c126](https://github.com/landoftherair/lotr2/commit/873c12641a0c1f019e5626657e415a4a35d013f7))
* **ui:** swallow other potential 'sys' of undefined error ([f0c3c7c](https://github.com/landoftherair/lotr2/commit/f0c3c7c6ac2289c39f51503f00791fa6e9c6160a))


### Features

* **combat:** add combat-stun ([f090a07](https://github.com/landoftherair/lotr2/commit/f090a078c45e18f2ca234b44822f942db89ce941))
* **gm:** add command to simulate gameloop crash; add crash recovery mechanism ([e224cd0](https://github.com/landoftherair/lotr2/commit/e224cd01ebfacfbfb9836516e0f872c448ccdd40))
* **gm:** add gm dupe command ([cfad864](https://github.com/landoftherair/lotr2/commit/cfad864308adee9bbdc2e9602f89095ebb4d433d))
* **item:** add new item upgrade system. items have a number of slots that can be upgraded, and upgrade materials can technically be anything. quest givers to come soon ([9b1922e](https://github.com/landoftherair/lotr2/commit/9b1922e2f139a1c085f53e3a36a5f671ed3fc82a))
* **item:** display upgrade slot text on item desc ([938f740](https://github.com/landoftherair/lotr2/commit/938f740fea5bd4635619da2371997a04697174db))
* **item:** items can now be upgraded via scripts, npcs like roma ([38f46db](https://github.com/landoftherair/lotr2/commit/38f46db98583c66700e18b2dc08b129c46718ca1))
* **item:** visually display upgrades on items ([0d1f74f](https://github.com/landoftherair/lotr2/commit/0d1f74ff0653518fafa5ed5ba52a5d5f966fa0a6))
* **map:** maps now store the Z level of each area in them for reference in game; no more hacky calculations needed ([210937f](https://github.com/landoftherair/lotr2/commit/210937feb26158537dc8a55ccbc788c22ca5f595))
* **npc:** npcs can strip and eat ([6a963fe](https://github.com/landoftherair/lotr2/commit/6a963fe1e9106d3a90ba0cb613f7f871a367b7eb))
* **quest:** quests can now take items from sack ([c2eec68](https://github.com/landoftherair/lotr2/commit/c2eec68b67d4bf6b67c74fbc1e24ba57763e0fa6))
* **spell:** add poison ([24b61fa](https://github.com/landoftherair/lotr2/commit/24b61faf921f2dc85efac30cc6e40c0e5b00761e))
* **spell:** add poison shell - doesnt work but will stop emailing me ([51b4950](https://github.com/landoftherair/lotr2/commit/51b495033a0fe50dbfe26f9db7d140e3954661cb))
* **spell:** add stun spell, debuff ([3759899](https://github.com/landoftherair/lotr2/commit/3759899d74f923fdf30ee4979513647c8f2b0fe5))
* **spell:** formattable tooltips for spells like poison ([0fe5999](https://github.com/landoftherair/lotr2/commit/0fe5999a4b91244cac60bcfcf7277bad96e2d282))
* **spells:** add recently effects with a nice tie-in to data format ([b159f2f](https://github.com/landoftherair/lotr2/commit/b159f2f995fed81eb49897e81dbcd45d2e48d0af))
* **ui:** display quest progress as a bar and number ([61d31af](https://github.com/landoftherair/lotr2/commit/61d31afc32326b5d7b1a30c7a3fc50646d8f501b))
* **ui:** show # of gold coins you own on tooltip, even when number is compressed ([8db98d8](https://github.com/landoftherair/lotr2/commit/8db98d865b7d1bbf94064cdfa9489cc8cb48bcf5))



## [1.9.1](https://github.com/landoftherair/lotr2/compare/v1.9.0...v1.9.1) (2020-12-19)


### Bug Fixes

* **core:** swap cws for ws ([1876e79](https://github.com/landoftherair/lotr2/commit/1876e79fe5a51b90d57d6bd6656285ff94433f88))


### Features

* **core:** swap from cluster to worker_threads ([2564a1f](https://github.com/landoftherair/lotr2/commit/2564a1fd4b34ed3efd43b24174f0efc5bee441a8))



# [1.9.0](https://github.com/landoftherair/lotr2/compare/v1.8.4...v1.9.0) (2020-12-17)


### Bug Fixes

* **combat:** modifyDamage works for physical attacks ([9fc7845](https://github.com/landoftherair/lotr2/commit/9fc7845ba4de4f360d24de28c5e3643337439ad0))
* **dialog:** dont put items in both hands or take items from both hands if only one is needed ([718d1e7](https://github.com/landoftherair/lotr2/commit/718d1e7a3902b5097d4179f3b886549ae341b1e6))
* **login:** enter button no longer triggers account selector ([db8aec8](https://github.com/landoftherair/lotr2/commit/db8aec84c31849732df9fd58d351e4f7a092ec37))
* **merchant:** cannot sell corpses, unowned items, or coins ([8826807](https://github.com/landoftherair/lotr2/commit/8826807c78e09e6624fc6dce5de7bf5762cc3f23))
* **npc:** aquaticOnly flag transfers correctly now ([2bda2b5](https://github.com/landoftherair/lotr2/commit/2bda2b5563d07d715191899827efc3d8b698e17e))
* **options:** options dialog doesn't screw up size-wise anymore ([e88e4f3](https://github.com/landoftherair/lotr2/commit/e88e4f3049e423df6df1a3990d1880b005a28a99))
* **player:** recalculate stats on level up ([f212f44](https://github.com/landoftherair/lotr2/commit/f212f44b76adf2af5dd0ed114f6e5a5c46984929))
* **player:** reviving should not show you as a corpse ([8008a54](https://github.com/landoftherair/lotr2/commit/8008a54c83736e78be336dc7a29e20d92046f0bd))
* **quests:** support checkLevel type, fix hasHeldItem, fix hp regen math re: botanist ([2f9fd5e](https://github.com/landoftherair/lotr2/commit/2f9fd5ec98834d29d4f340ebef6fdc6a91e34b8b))


### Features

* **book:** can read books, and you start with a newbie book ([613cb00](https://github.com/landoftherair/lotr2/commit/613cb000fe07657f3972e57e590034f06fcbc786))
* **box:** boxes can now be opened ([b107023](https://github.com/landoftherair/lotr2/commit/b107023da33837419eb6b5d8e654f830d1a51107))
* **discord:** add global char for discord purposes ([3b66cee](https://github.com/landoftherair/lotr2/commit/3b66cee0e99da0c7a5555c059a3de709018ff7e3))
* **item:** add minorhp/minormp effects for stat potions ([66e182d](https://github.com/landoftherair/lotr2/commit/66e182d7b83d10ddda0014e8e74c477baa3afeae))
* **newbies:** newbies start with a book to help them out ([6a5c7ae](https://github.com/landoftherair/lotr2/commit/6a5c7ae7c9507c3dadaffefe3a49769cc292ed96))
* **npc:** add ability to set alignment from npc scripts ([3f4e4d5](https://github.com/landoftherair/lotr2/commit/3f4e4d59a52be9cf9716776e8c4968c86db425c8))
* **quest:** add quest log ui ([c1ca71d](https://github.com/landoftherair/lotr2/commit/c1ca71dd45da8f960ab6f83c836fe4c716123a22))
* **quests:** quests can now be added. kill quests or fetch quests ([2bc881e](https://github.com/landoftherair/lotr2/commit/2bc881e871985b71d4e28e4f6df2c921683be74f))
* **spawner:** expand knowledge radius to 8 (4 offscreen in every direction) ([f68d461](https://github.com/landoftherair/lotr2/commit/f68d461d7d439fb46645f78efad064fb925134f5))



## [1.8.4](https://github.com/landoftherair/lotr2/compare/v1.8.3...v1.8.4) (2020-12-12)


### Bug Fixes

* **core:** no more throwing errors for no reason when registering etc ([24e2a7d](https://github.com/landoftherair/lotr2/commit/24e2a7d05a8016b62aaf2baaab668aaa1ad8d4d3))
* **ui:** allow for hiding the resolution warning ([f646edb](https://github.com/landoftherair/lotr2/commit/f646edbcb492c20bba5c79f0c8c70470b4037aa2))
* **ui:** force modals to scroll on screens <900px tall ([31c8759](https://github.com/landoftherair/lotr2/commit/31c875998be5f1015e1100df3de1d33592c32bca))
* **ui:** properly bind to component callback in prod settings ([dc25a98](https://github.com/landoftherair/lotr2/commit/dc25a98ced7f5db58b3bc6a2f9b9625a4060e045))


### Features

* **server:** add option to block registrations ([c1b9822](https://github.com/landoftherair/lotr2/commit/c1b982278e6f373d3292adeaefb3aa6fd2ac7b62))



## [1.8.3](https://github.com/landoftherair/lotr2/compare/v1.8.2...v1.8.3) (2020-12-11)


### Bug Fixes

* **encrust:** show encrust gem when identifying item ([293cc85](https://github.com/landoftherair/lotr2/commit/293cc85d81dac52151a9e869bdb8b8bdaf008647))
* **npc:** encruster should not require a left hand for appraisals ([6c5d05a](https://github.com/landoftherair/lotr2/commit/6c5d05ac19b312ccd361040d3f4b41f63fa81e29))


### Features

* **char:** undecided > traveller ([c098a20](https://github.com/landoftherair/lotr2/commit/c098a202d778507cd413ed91e495e46f81871051))
* **combat:** combat now uses damageFactor where applicable ([899f9be](https://github.com/landoftherair/lotr2/commit/899f9be56c80a344b53571c135d71f45c756ee69))
* **ui:** char create upgrades ([60480f4](https://github.com/landoftherair/lotr2/commit/60480f412b126e5e71786168aa1cd582b46c2fda))



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



