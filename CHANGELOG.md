## [2.0.1](https://github.com/landoftherair/lotr2/compare/v2.0.0...v2.0.1) (2021-05-14)


### Bug Fixes

* **combat:** aoe attacks wont target someone unless you explicitly target someone ([3f380c3](https://github.com/landoftherair/lotr2/commit/3f380c3114267e57ff1372abd2fc2e6cc2c9311c))
* **combat:** cstun will no longer stack ([5315e8a](https://github.com/landoftherair/lotr2/commit/5315e8ad7c0d269e6663aa6c095365571c8827a9)), closes [#227](https://github.com/landoftherair/lotr2/issues/227)
* **combat:** dont clear target if you aoe and someone else dies ([0e1273a](https://github.com/landoftherair/lotr2/commit/0e1273a3d0d0377cd1c7ff9c120e73ab0ca0c585))
* **core:** don't log messages for dungeon kills ([888a583](https://github.com/landoftherair/lotr2/commit/888a58301a1b8dfda193ea6703842f4631aa14cf))
* **core:** GMs could work around in inactive holidays if needed ([eee95e1](https://github.com/landoftherair/lotr2/commit/eee95e14fffb412c5163261ec4ac51a3abb184ae))
* **core:** respawning while being teleported across maps still needs to make you leave the origin map some way or another ([cae1a02](https://github.com/landoftherair/lotr2/commit/cae1a02856496aa57496d0e3e53e903ae6c140e2))
* **core:** sometimes a player watcher wouldn't exist ([f2b8bae](https://github.com/landoftherair/lotr2/commit/f2b8bae4bc843b6c8c41f93c6479dc707f258b35)), closes [#230](https://github.com/landoftherair/lotr2/issues/230)
* **core:** spawners would not trigger if the map hadn't previously been visited when game started ([34cc907](https://github.com/landoftherair/lotr2/commit/34cc907cdc14e99ffdc2ed420f9a6a8f453b6f90))
* **core:** timer should be enabled all the time ([1ba37bd](https://github.com/landoftherair/lotr2/commit/1ba37bd7caf6890b108ea48426fecb3c31459ee9))
* **discord:** only load channels if the variables are set ([b8df059](https://github.com/landoftherair/lotr2/commit/b8df0591c55ecac8a662758969fe4aa26fadf169))
* **effect:** attribute could be nan in some cases, default to 100% so someone will report it if they see it ([4c5f53e](https://github.com/landoftherair/lotr2/commit/4c5f53e5b9898e0b1951c01a602475bf5e336b58))
* **effect:** permanent effects on equipment will not trigger recently effects ([70bcafd](https://github.com/landoftherair/lotr2/commit/70bcafdc488075e44ad63e7f6ca1bd0b05717271))
* **instance:** instances would not properly reset when leaving them ([5db70cf](https://github.com/landoftherair/lotr2/commit/5db70cf877da8f9b4b549621a83c3d81d1f9dcc1))
* **item:** equipping items from lockers while underleveld no longer works ([cb8c321](https://github.com/landoftherair/lotr2/commit/cb8c321db584e6cfed14b94ee69b4eb5167b6515))
* **mood:** mood enemies will not heal instantly out of combat ([14bfdd8](https://github.com/landoftherair/lotr2/commit/14bfdd8fd6810bca51884d758d09f01cdefcb49e))
* **npc:** padder will only accept armor slot items, and checks if you can use the items now ([4cac778](https://github.com/landoftherair/lotr2/commit/4cac7783e1ce6d9a4b21a008b85778f72836ceef)), closes [#226](https://github.com/landoftherair/lotr2/issues/226)
* **npc:** takeItem now supports exact check ([09a2b64](https://github.com/landoftherair/lotr2/commit/09a2b647409dd4d80137cc26d124605ef5fdfc70))
* **spawner:** calculate stats after the npc is made elite ([03cbe5a](https://github.com/landoftherair/lotr2/commit/03cbe5acf2a9efec8ff9844806fab240cb9038b0))
* **spawner:** hopefully fix spawner timing ([aade4fa](https://github.com/landoftherair/lotr2/commit/aade4fa01a6a2cc0d7356d7c94caa6a41a1b2e59))
* **spell:** aoe spells can now be used while blind ([9f419db](https://github.com/landoftherair/lotr2/commit/9f419dbc585621933a4b2a54fda18078e4f265a1))
* **spell:** aoe spells no longer cost per target ([ea85fd5](https://github.com/landoftherair/lotr2/commit/ea85fd56757d09c1112f7cf39f2ea3953f7fd5d7))
* **spell:** augury has a typo ([3155356](https://github.com/landoftherair/lotr2/commit/315535670539d8ec75b40228afc622f51324d4af))
* **spell:** augury should track above/below ([dd017cc](https://github.com/landoftherair/lotr2/commit/dd017cc49845bae16bd2e92d63dc7ea7242c2c30))
* **spell:** enemies that cannot cast a spell will no longer attempt to ([b14ad4a](https://github.com/landoftherair/lotr2/commit/b14ad4a9652f2c6a1c2ed3a9d3d3fd39fd252ad6))
* **spell:** familiars are now added to the monster group of the caster if applicable ([af9f02c](https://github.com/landoftherair/lotr2/commit/af9f02c1e95c877a90905f68f93b516975b92a77))
* **spell:** shred can only hit at range 0 ([2d347b8](https://github.com/landoftherair/lotr2/commit/2d347b8e5a4dfad6d0037b80e313c9a34564c11a))
* **spell:** spells can no longer be reflected by enemies ([77918ff](https://github.com/landoftherair/lotr2/commit/77918ff28303c649ed660fbddabca9fe84ea1c8a))
* **ui:** active target should correctly use direction and not verticality ([1e4e188](https://github.com/landoftherair/lotr2/commit/1e4e188e1da46cf23518120dd6a9db143b4a0036))
* **ui:** fix buffs in active target ([e863c46](https://github.com/landoftherair/lotr2/commit/e863c4641b71d61ff87422c8bbe498900a51529e))
* **ui:** fix succor bleeding into other items, shrink text slightly ([a9761d6](https://github.com/landoftherair/lotr2/commit/a9761d60e96ea9054bfcdfcf1c6943db672b8453)), closes [#220](https://github.com/landoftherair/lotr2/issues/220)
* **ui:** invalid items no longer crash ui ([6be5685](https://github.com/landoftherair/lotr2/commit/6be5685ba44cccf2bdc1f08e8b3d633fdb62a662))
* **ui:** market buy option greyed out if your gold is too low ([50ad754](https://github.com/landoftherair/lotr2/commit/50ad75466112b87ee025b217b8ddd70f720e78ce))
* **ui:** market will now unload properly when you walk away ([160ca72](https://github.com/landoftherair/lotr2/commit/160ca72a1a6cda6135386055dd72a20317583644))
* **ui:** restoration/conjuration had wrong icons ([a6c0cd8](https://github.com/landoftherair/lotr2/commit/a6c0cd8fcd8cd251c303ccab9220457993a491dd))
* **ui:** slightly improve buff ui ([b0c8ef5](https://github.com/landoftherair/lotr2/commit/b0c8ef571a58a2a466def7f06e2fe6c861a25435)), closes [#222](https://github.com/landoftherair/lotr2/issues/222)


### Features

* **core:** add logs when lairs die and their anticipated respawn ([b30a8bc](https://github.com/landoftherair/lotr2/commit/b30a8bc7f541cfcc085af60a725e6f378bc3c155))
* **core:** improve map load performance ([12ccdb5](https://github.com/landoftherair/lotr2/commit/12ccdb54d41e90ce555f6fcadbc16a5dd11f8fe6))
* **core:** instead of cloning content on demand, freeze it ([9e753eb](https://github.com/landoftherair/lotr2/commit/9e753ebb6f56da780867a07014a43f50207711fa))
* **core:** only save spawners with ticks, and add their name for db lookup ([535dde6](https://github.com/landoftherair/lotr2/commit/535dde64b4c950fad37abd6416e71f7e3b61f76a))
* **core:** searching now loots gold automatically ([2687daf](https://github.com/landoftherair/lotr2/commit/2687daf374b69bfc4e4cb1a56d3c67aae1268db3)), closes [#217](https://github.com/landoftherair/lotr2/issues/217)
* **discord:** add marketplace embeds ([9746aad](https://github.com/landoftherair/lotr2/commit/9746aad8bd283cfa97ef7ed31370262343d64509))
* **discord:** can search items and npcs ([ed22ef1](https://github.com/landoftherair/lotr2/commit/ed22ef19a0ca20e70efb5ff0d401bb23f3e04350)), closes [#196](https://github.com/landoftherair/lotr2/issues/196)
* **event:** add double trouble ([7d8ef58](https://github.com/landoftherair/lotr2/commit/7d8ef5829f281bd75dbd5d891f525a4e34adbaec))
* **event):** events can be tied to npcs, which will not fire if the npc is dead ([915c4c2](https://github.com/landoftherair/lotr2/commit/915c4c26138ae128d88366e07b3ae07369acb30f))
* **gm:** add search items command ([ddf4971](https://github.com/landoftherair/lotr2/commit/ddf4971a8aa53dc969882821dc4a0678b98ecde9))
* **gm:** add teleportto command ([cba1010](https://github.com/landoftherair/lotr2/commit/cba101028464e4eb39c5d629519000282897cecd))
* **gm:** item create lets you use both hands ([8a10cc2](https://github.com/landoftherair/lotr2/commit/8a10cc232b639b588dfd3f24ee013d071263cef6))
* **holiday:** add christmas ([bdf2d05](https://github.com/landoftherair/lotr2/commit/bdf2d059cd5249ebcbaa2529b5ccb1399521fe1d))
* **holiday:** add halloween ([a4d7669](https://github.com/landoftherair/lotr2/commit/a4d7669194df569488ef353e7966cfa3a8fa4b76))
* **holiday:** add thanksgiving ([9eaac59](https://github.com/landoftherair/lotr2/commit/9eaac59f1cb525a8d3ee2fd703b9f5735444ad23))
* **holiday:** add trick or treat for halloween ([f511ee8](https://github.com/landoftherair/lotr2/commit/f511ee8915cbf73689bca04cd29850cfee20537b))
* **holiday:** christmas elves can drop presents ([4076b35](https://github.com/landoftherair/lotr2/commit/4076b3531ccbc38d86c19733152979595d6bb648))
* **item:** items can now have break effects ([abdda2c](https://github.com/landoftherair/lotr2/commit/abdda2c21795240c41415b5d9b3323fc286a380a))
* **npc:** npc dialog now supports drop items, kill self, and check hostile enemies nearby ([a3ddfb9](https://github.com/landoftherair/lotr2/commit/a3ddfb978518d73493429e58d9c4b89bdb35d613))
* **npc:** npcs can now give currency ([5de9056](https://github.com/landoftherair/lotr2/commit/5de905600d7f6d3ad030583f3d92d1e460f32e9c))
* **npc:** rare npcs will announce their killer ([81f5e17](https://github.com/landoftherair/lotr2/commit/81f5e173fe813a71757c817dbc753fb07f18a29c))
* **player:** xp gain is more gradiented instead of 1 exp if you pass the map xp cap ([df03e98](https://github.com/landoftherair/lotr2/commit/df03e98631d3c082588a675e5ea948a05dd16438))
* **spell:** add halloween horror spawn spell ([db79dd4](https://github.com/landoftherair/lotr2/commit/db79dd4068a6fccab2063ca431d853107b169997))
* **spell:** add shred spell for players ([7da521b](https://github.com/landoftherair/lotr2/commit/7da521b21f09dc086a13ecb42ea20f6660da4b58))
* **spell:** augury can now pry for any npc in the game ([7f43927](https://github.com/landoftherair/lotr2/commit/7f43927a3f250d5a92a338164b58991781e89d5e))
* **spell:** can resurrect enemies as zombies; fix resurrect/revive ([fcede42](https://github.com/landoftherair/lotr2/commit/fcede4235e1af3ed7e6587c1b9a51e0dd73ba38a))
* **ui:** add decor animation sheet ([9113c65](https://github.com/landoftherair/lotr2/commit/9113c655708fe804b01a242bb94dcced6a957e2a))
* **ui:** add decor animations ([1b12893](https://github.com/landoftherair/lotr2/commit/1b128938d5f2fb8d7154eee27c9bab928fcdd32a)), closes [#232](https://github.com/landoftherair/lotr2/issues/232)
* **ui:** add item animations ([3a56087](https://github.com/landoftherair/lotr2/commit/3a560871fbeada70b533da25be5e1cc85cbefab7))
* **ui:** add option for tab or dropdown lockers ([63de954](https://github.com/landoftherair/lotr2/commit/63de9544a8ced5c8070db6d590750ec4e0fa9516))
* **ui:** clean up map name in char select ([358d1b1](https://github.com/landoftherair/lotr2/commit/358d1b1b0452e0a8598cbeff822caa9b87ef5254))
* **ui:** desktop players will see a reload ui button ([6877b88](https://github.com/landoftherair/lotr2/commit/6877b880a87fd32af55a1f055af810813a409636))
* **ui:** inscribed runes are green in the list ([4a14dd7](https://github.com/landoftherair/lotr2/commit/4a14dd78f152af2a79835453d9611dbb1d856d50)), closes [#216](https://github.com/landoftherair/lotr2/issues/216)
* **ui:** make the welcome text a bit nicer ([243c7e8](https://github.com/landoftherair/lotr2/commit/243c7e8d085a5df53e1c67c5daa4aad49ad24ee1))
* **ui:** show % to next level on xp bar ([acf21e4](https://github.com/landoftherair/lotr2/commit/acf21e44e00d03d3a6dc99f1374e092b47e5df25))



# [2.0.0](https://github.com/landoftherair/lotr2/compare/v1.13.0...v2.0.0) (2021-05-07)


### Bug Fixes

* **ai:** ai wont fight each other anymore ([1a5aaa0](https://github.com/landoftherair/lotr2/commit/1a5aaa07cf87af11ea8d02acf8c1d781e3525e79))
* **attack:** npcs with halberds won't miss anymore from a tile away ([92912b5](https://github.com/landoftherair/lotr2/commit/92912b5063fbc7aed1407b9a4b2925545b439a76))
* **attack:** skill gain should be 1 per attack use, not 1 per hit ([4865e2f](https://github.com/landoftherair/lotr2/commit/4865e2f1d33829d5100b7f6a614fbe4e21ffe61f)), closes [#197](https://github.com/landoftherair/lotr2/issues/197)
* **book:** books with unlimited pages no longer ignore taking page items ([9172007](https://github.com/landoftherair/lotr2/commit/9172007b4792532cae9e8e2b78c5d5d5029c109d))
* **combat:** items held that aren't yours will no longer work ([c10d046](https://github.com/landoftherair/lotr2/commit/c10d0469295fc95beb4d75ddd20ce5758e12b2f4))
* **combat:** pass addAgro arguments in right order to ensure attacker loses buffs ([fe650b1](https://github.com/landoftherair/lotr2/commit/fe650b18befdebad5e92c3f60a534a73322a5aa1)), closes [#163](https://github.com/landoftherair/lotr2/issues/163)
* **combat:** volcano stance and other dps-outgoing spells will no longer trigger two kills ([e4333e9](https://github.com/landoftherair/lotr2/commit/e4333e9e879c5307824d96c31fd6ace840565cf3))
* **command:** can no longer drink while stunned ([5374c9a](https://github.com/landoftherair/lotr2/commit/5374c9a60b7231040f2b9bd6d74e1c8e4f822982)), closes [#129](https://github.com/landoftherair/lotr2/issues/129)
* **config:** config manager should use content manager ([0d3a705](https://github.com/landoftherair/lotr2/commit/0d3a705d3ef7f12f2d27a4096cd00f7be3554041))
* **core:** daily quests and items are stored per char slot separate from the character, closes [#142](https://github.com/landoftherair/lotr2/issues/142) ([e57aa82](https://github.com/landoftherair/lotr2/commit/e57aa823707e1601e3fbcb9597f297a33b3d1197))
* **core:** fix crash from droptables ([4a59418](https://github.com/landoftherair/lotr2/commit/4a594186c3b039ff9458dcc7611680c72b9bfd84))
* **core:** fix potential crash bug with findfamiliar ([4971c2d](https://github.com/landoftherair/lotr2/commit/4971c2d49d0f0a4797e945f56e71d7a99f12aeb4))
* **core:** fix registration process, logout/register flow, etc ([b181332](https://github.com/landoftherair/lotr2/commit/b181332cbd0ae92d3df48f32d32e4d222c33d5b0)), closes [#164](https://github.com/landoftherair/lotr2/issues/164)
* **core:** I cri ([3ac9d3c](https://github.com/landoftherair/lotr2/commit/3ac9d3c9217e0ff54cd6198172dec1220ce02514))
* **core:** log when undefined effects are being made ([d8a7077](https://github.com/landoftherair/lotr2/commit/d8a707751dadcc1dff26502715d6d7abb88f6520))
* **core:** logout should leave party, as well as leave game correctly ([54671e2](https://github.com/landoftherair/lotr2/commit/54671e2b84c8eab80bdcd7e67e9df1e248300e92))
* **core:** potential fix for being stuck with the game saying you're already logged in ([9cc32b0](https://github.com/landoftherair/lotr2/commit/9cc32b0d71d74317f77770fd18008c3833394dab))
* **core:** really fix npc drops ([3b60d9a](https://github.com/landoftherair/lotr2/commit/3b60d9a13fe601d252e9f01fa7a0adcc39fb8596))
* **core:** refactor static text ([867ca80](https://github.com/landoftherair/lotr2/commit/867ca80c929ec7dc809b5efb0d46700a705d38bd)), closes [#207](https://github.com/landoftherair/lotr2/issues/207)
* **daily:** daily quests no longer reset on logout ([2402bdc](https://github.com/landoftherair/lotr2/commit/2402bdcf2d8da358c088b57d6cf304165c8b169b)), closes [#201](https://github.com/landoftherair/lotr2/issues/201)
* **discord:** fix discord lobby topic ([8ac2715](https://github.com/landoftherair/lotr2/commit/8ac2715d75734f06b50bd522ab64a8f988e5ceb1))
* **effect:** effect display spaces out new effects ([c504a8a](https://github.com/landoftherair/lotr2/commit/c504a8a108b4940e619f26e469ce1c16d85d0ba6)), closes [#187](https://github.com/landoftherair/lotr2/issues/187)
* **event:** events will no longer stack with themselves ([f55b675](https://github.com/landoftherair/lotr2/commit/f55b67581af7d8929a8cf27e9b1c70474ee1bd22))
* **event:** fix bad events being created ([759c92c](https://github.com/landoftherair/lotr2/commit/759c92cb52c47d8636cf6860f7907556db12956e))
* **event:** prevent events without names from being created ([5002ea0](https://github.com/landoftherair/lotr2/commit/5002ea037c7799481c7fab60e80c98fe11505ef9))
* **item:** dont drop bad items on the ground ([94e8d45](https://github.com/landoftherair/lotr2/commit/94e8d450f216efa0e15510c032cef0223cefbdde))
* **item:** equipping two items with the same effect and removing one will no longer remove the effect ([7270584](https://github.com/landoftherair/lotr2/commit/7270584efbd873802ed7ad3d3823518a8879bb13))
* **item:** lore scrolls have a visible description again ([c196c19](https://github.com/landoftherair/lotr2/commit/c196c19eda1aa4b59a0f85e0ca30852ca6cf8315))
* **map:** sub is required to walk in sub areas ([d19a191](https://github.com/landoftherair/lotr2/commit/d19a1911216eb17a6bb4ccd7a0e3527fba650299)), closes [#194](https://github.com/landoftherair/lotr2/issues/194)
* **market:** handle leather ring rng items properly ([3690cad](https://github.com/landoftherair/lotr2/commit/3690cad6a84ef88ab4335686e8120d3f37e824bb))
* **npc:** adjust csaraxa ai dialog to match crazed ([d4abb4d](https://github.com/landoftherair/lotr2/commit/d4abb4d5962880a7dc0fa16bbb77028b9581d199))
* **npc:** npc drop wouldnt load map or region droptables correctly ([e493b21](https://github.com/landoftherair/lotr2/commit/e493b213b937165af1191142f2eb7746ea23bd48))
* **party:** parties with a big level discrepancy should generate less xp ([8d379ee](https://github.com/landoftherair/lotr2/commit/8d379ee133187958fd829720e3c77571156aa05d))
* **potion:** skill potion can only grant skills you have training in ([eeec3c4](https://github.com/landoftherair/lotr2/commit/eeec3c43f547a474e9da759692d38622d7a0156e))
* **quest:** really fix daily quests not saving properly ([fc85329](https://github.com/landoftherair/lotr2/commit/fc853292074613ca1622e0a6a05ee1e86cb6d9c0))
* **rune:** remove invalid runes on login ([017bdc4](https://github.com/landoftherair/lotr2/commit/017bdc4620c1153bc42dcd1bf38e6d6970875a01)), closes [#192](https://github.com/landoftherair/lotr2/issues/192)
* **spawner:** spawners will now load with a tick delta when the map loads based on when they saved, meaning boss spawners 'tick' in the background ([1b70f82](https://github.com/landoftherair/lotr2/commit/1b70f82e62b124e3bca464bd96484b418ee9c0fb)), closes [#191](https://github.com/landoftherair/lotr2/issues/191)
* **spell:** add another safeguard to revive; tweak message timing ([7980fe2](https://github.com/landoftherair/lotr2/commit/7980fe2e92871ab95f8283bb026d9f5e20dc25fd)), closes [#156](https://github.com/landoftherair/lotr2/issues/156)
* **spell:** bouncing missiles no longer hits green ([1f9a6ae](https://github.com/landoftherair/lotr2/commit/1f9a6aefa5539b6b6d94e445cc325ae0c9e67739)), closes [#147](https://github.com/landoftherair/lotr2/issues/147)
* **spell:** disarm and trap require learning first ([33f0f39](https://github.com/landoftherair/lotr2/commit/33f0f393888a07e91d5f05875416c45d8e4bb368))
* **spell:** hide should work in dark ([ab624d6](https://github.com/landoftherair/lotr2/commit/ab624d6ffc4898201b5d49440ff5ef20629e8ffd))
* **stat:** stealth should be rounded down ([9b1a7f3](https://github.com/landoftherair/lotr2/commit/9b1a7f3233106898777287416296968cbb2b8024))
* **trait:** invalid items with traits no longer work ([9e466ad](https://github.com/landoftherair/lotr2/commit/9e466ad32ad2e61660a1985aaa4122abaa82e7ba)), closes [#193](https://github.com/landoftherair/lotr2/issues/193)
* **trait:** reset traits gives +1 to account for initial trait ([41b5a4e](https://github.com/landoftherair/lotr2/commit/41b5a4ec212f7ddd4b1055a88cb5c804048ec927)), closes [#158](https://github.com/landoftherair/lotr2/issues/158)
* **trap:** traps are hell. aoes work again globally, I hope ([97912e1](https://github.com/landoftherair/lotr2/commit/97912e16bbb1afba1eb29f86056acf123675c888)), closes [#188](https://github.com/landoftherair/lotr2/issues/188)
* **ui:** multi-hit attacks no longer spam sfx ([0f87c71](https://github.com/landoftherair/lotr2/commit/0f87c71481b8997d22fc1b23cff14ecd28627278)), closes [#86](https://github.com/landoftherair/lotr2/issues/86)
* **ui:** use consistent urls everywhere for images ([d37e92a](https://github.com/landoftherair/lotr2/commit/d37e92a82da2b5bbfc7eaf39475a7e22add1bf7c))
* **xp:** xp post-20 now grows somewhat linearly instead of being static ([08d4f33](https://github.com/landoftherair/lotr2/commit/08d4f3371d0116256a004b618396cc973210fe45))


### Features

* **ai:** let npcs target green npcs ([d20ee88](https://github.com/landoftherair/lotr2/commit/d20ee88490b2931864c45ed6801276b1a448159a))
* **command:** show stats leader works ([26d9f65](https://github.com/landoftherair/lotr2/commit/26d9f65cd221725702543e471ab45e0f5a4be455)), closes [#121](https://github.com/landoftherair/lotr2/issues/121)
* **core:** add traveller trainer ([4790ddd](https://github.com/landoftherair/lotr2/commit/4790ddda1d3891c4a5a938a05f0de838a7f0651e))
* **core:** healers and mages get +10 free mp regen ([6218674](https://github.com/landoftherair/lotr2/commit/6218674bd602aa67344bad93cc6c7f34e2121150))
* **core:** refactor all jsons to go through content manager, add more game settings ([fdda802](https://github.com/landoftherair/lotr2/commit/fdda802c4b88c400d04f48ed18384f9c410decc5))
* **dedlaen:** add permanent darkness ([241a9c7](https://github.com/landoftherair/lotr2/commit/241a9c73c8bc02c8144c8022aa033c16fe025c2e))
* **effect:** newbie only works until level 10 ([684c110](https://github.com/landoftherair/lotr2/commit/684c11036195c129cbb8199fd7872a22fbe6a076))
* **event:** add friendship festival ([a2418c7](https://github.com/landoftherair/lotr2/commit/a2418c78f44d063031b8039eb429926be4722437))
* **event:** add harvest moon event ([7631e88](https://github.com/landoftherair/lotr2/commit/7631e889d149bd7a27f866a4c65f46d90329e4b1))
* **event:** rare monster spawn event works ([e355db1](https://github.com/landoftherair/lotr2/commit/e355db169e650d2ea6394e5d3ef307c4ae43499f))
* **gm:** exi/exc now let you drill down into the target ([12372af](https://github.com/landoftherair/lotr2/commit/12372af70f3aa0606384f1e704ae2e2f02173194))
* **map:** add dedlaen maze ([bc916e2](https://github.com/landoftherair/lotr2/commit/bc916e272f29b82ff56a766f87e69756eee450ff))
* **map:** add map events ([c5829d9](https://github.com/landoftherair/lotr2/commit/c5829d9c9f372a93c5e6f79265461df181b65d7c))
* **map:** add risan mines ([7e93ba6](https://github.com/landoftherair/lotr2/commit/7e93ba605aabc93fdffd28acc89cdc33d9ca7f36))
* **market:** add the marketplace ([9b73a89](https://github.com/landoftherair/lotr2/commit/9b73a898f38e4238872fdf1cb2239d5de8d8c84e))
* **npc:** add axp swapper ([20f201d](https://github.com/landoftherair/lotr2/commit/20f201d3541797816e1b4752a9f44d2e5c8d076b))
* **npc:** add buffer npc ([fe3d6c2](https://github.com/landoftherair/lotr2/commit/fe3d6c29313aa9dd4bd81a4306512f8661f0a6cc))
* **npc:** add cosmetica ([9f97b6c](https://github.com/landoftherair/lotr2/commit/9f97b6cacdbe9a0197023aa3605650a847ae1a22))
* **npc:** add immobilze/spider immobilize ([23cb00e](https://github.com/landoftherair/lotr2/commit/23cb00ea234a55b2d091f324b48f56ff46763513))
* **npc:** add item mod npc ([16288aa](https://github.com/landoftherair/lotr2/commit/16288aaa28b9aff3d493e70b07496a47232b5f11))
* **npc:** add padding npc ([f622d19](https://github.com/landoftherair/lotr2/commit/f622d1919ac89defe6904a8ac10600dc0d740fc1))
* **npc:** add reset npc ([57cf4b5](https://github.com/landoftherair/lotr2/commit/57cf4b55a15ec620fb10403f014ed434bc3ba146))
* **npc:** can look for a rough item name instead of exact name if needed ([f70ca0c](https://github.com/landoftherair/lotr2/commit/f70ca0cfb0ee65128104b153132ab7671c9d1590))
* **npc:** can now merge items in hands ([82cca4a](https://github.com/landoftherair/lotr2/commit/82cca4ad2801fffff110f1c358bad6ab3d19f5b7))
* **npc:** can query specific values on items ([592c5e1](https://github.com/landoftherair/lotr2/commit/592c5e1519aab74d966790ebb2920a953f8e349f))
* **npc:** npcs can now give items based on your class ([24ac736](https://github.com/landoftherair/lotr2/commit/24ac7366365e4c7d9e43b73f8ccb788c02c3cb64))
* **npc:** npcs can now upgrade based on class names ([8759b7d](https://github.com/landoftherair/lotr2/commit/8759b7dee71d6c21c57d7a9af6719122868e1240))
* **quest:** quests can have no requirements at all ([917fb40](https://github.com/landoftherair/lotr2/commit/917fb40dbee8be392dc2d7c510d72dfbf4e4dfd5))
* **spell:** add catacombs lich summon skill ([c5392e8](https://github.com/landoftherair/lotr2/commit/c5392e868fd5cee070bdff2991cd1f4a7b12d26d))
* **spell:** add dedlaen crypt thing punch ([845ae6b](https://github.com/landoftherair/lotr2/commit/845ae6b2ee81416a54198ccc4949149c37b6fbf3))
* **spell:** add find familiar golem ([008d98c](https://github.com/landoftherair/lotr2/commit/008d98ca5ac47895df077fd19984deae60614e8b))
* **spell:** add ghost wail ([6888c3a](https://github.com/landoftherair/lotr2/commit/6888c3a480d19988a2ea666e1445729650bebd98))
* **spell:** add necrotic aura ([f5e40ec](https://github.com/landoftherair/lotr2/commit/f5e40ec27175e4a9e981f150fc384b1a77dbb20f))
* **spell:** add regions to succor ([18f2262](https://github.com/landoftherair/lotr2/commit/18f2262e28745ee3ee4de9c815bed2962da6447b)), closes [#178](https://github.com/landoftherair/lotr2/issues/178)
* **spell:** add vampire mist form ([2b61029](https://github.com/landoftherair/lotr2/commit/2b6102970deda2909002c57cd02a693836fe6abc))
* **spell:** allow better casting of npc spells with overrides ([7642152](https://github.com/landoftherair/lotr2/commit/76421523e4219362356fc56e248ef51abd3568f3))
* **spell:** buff spells have a static output based on character ([9b53133](https://github.com/landoftherair/lotr2/commit/9b531335f6f5a9f6a64cde0bb168e4290a3141eb)), closes [#180](https://github.com/landoftherair/lotr2/issues/180)
* **spell:** identify now tells traits and if it modifies physical attributes ([0680293](https://github.com/landoftherair/lotr2/commit/06802936a5fe2812ca60017bce0c0c83f2e90bc1)), closes [#146](https://github.com/landoftherair/lotr2/issues/146)
* **spell:** notify on stance/song stop ([32725a8](https://github.com/landoftherair/lotr2/commit/32725a88a82cca41c266ff7789ffdc3303385b1e))
* **spell:** singing now gives thief skill per tick like hide ([e58678d](https://github.com/landoftherair/lotr2/commit/e58678d750c1c8d0135fbfc44a771ee6da4f6f1d)), closes [#150](https://github.com/landoftherair/lotr2/issues/150)
* **spell:** songs can be canceled by recasting like stances ([142e38c](https://github.com/landoftherair/lotr2/commit/142e38c88c95a2e2f9160b4f1c5f4720c6b18834))
* **stat:** mitigation should never go below 0 ([7f4c3e5](https://github.com/landoftherair/lotr2/commit/7f4c3e5aa575fcd8b3774f4a154d2cb04e2adde1))
* **trait:** add dancing trait ([1b9ef0c](https://github.com/landoftherair/lotr2/commit/1b9ef0cb44de023cb508e503f901352ca6ab15ea))
* **ui:** add sell all to vendor ([5cfb59b](https://github.com/landoftherair/lotr2/commit/5cfb59b59217f3eeeccf378c360036484bfa14b9)), closes [#179](https://github.com/landoftherair/lotr2/issues/179)
* **ui:** allow health % to be configured for dying border ([093261e](https://github.com/landoftherair/lotr2/commit/093261ea70e48e53fae2010485c704eb628d1171)), closes [#151](https://github.com/landoftherair/lotr2/issues/151)
* **ui:** can hide mismatch warning ([18c9b8a](https://github.com/landoftherair/lotr2/commit/18c9b8a293bef598b6aed12a3bce3bf5f0e0a159))
* **ui:** can navigate lockers with mouse wheel ([6fed135](https://github.com/landoftherair/lotr2/commit/6fed135b5deb3fe04039ad8ad5a20252be43c0dc))
* **ui:** change locker selector to dropdown instead of tabs ([1fe93e2](https://github.com/landoftherair/lotr2/commit/1fe93e21c0c631b415dcfdeacb6d35848ae00de4))
* **ui:** destroy on drop items should not respond to right click ([ab74ced](https://github.com/landoftherair/lotr2/commit/ab74ced6869889cf1d29fecd60229f4cc73ae380))
* **ui:** hide npcs with direction.corpse set ([cbe7825](https://github.com/landoftherair/lotr2/commit/cbe78253d86b6e9f7d0a5992e2a230e736e67743)), closes [#182](https://github.com/landoftherair/lotr2/issues/182)
* **ui:** link to download from in game ([0a3c9d9](https://github.com/landoftherair/lotr2/commit/0a3c9d96b105081c6335448c276917ca22046383)), closes [#177](https://github.com/landoftherair/lotr2/issues/177)
* **ui:** link to global char viewer in lobby ([4358021](https://github.com/landoftherair/lotr2/commit/4358021c49f3daf5d7e071ceae6ce148dc3ac8d8))
* **ui:** show cosmetic in silver store ([60580d0](https://github.com/landoftherair/lotr2/commit/60580d0cbe43f174d642f90317850ec36d1f8cae)), closes [#130](https://github.com/landoftherair/lotr2/issues/130)
* **ui:** sort sellall dialog options ([d191577](https://github.com/landoftherair/lotr2/commit/d1915775a08f30e9675244b4092dc3752c27cbd6))
* **world:** teleports can now require a class; a thief-only area has been added ([330d93b](https://github.com/landoftherair/lotr2/commit/330d93b88ddd1fd8fbbce2079c0f0a06fdf31326))



# [1.13.0](https://github.com/landoftherair/lotr2/compare/v1.12.5...v1.13.0) (2021-04-30)


### Bug Fixes

* **core:** better login process to prevent weird errors from a socket login ([ce86a90](https://github.com/landoftherair/lotr2/commit/ce86a90b7f5d7b2b41a741a7d5f100b233395d69))
* **core:** callbacks aren't guaranteed to exist ([dda5f15](https://github.com/landoftherair/lotr2/commit/dda5f159e5ea75c0ebecdf0187599a321c2e41ca))
* **core:** could not add coins to full sack ([c725cb1](https://github.com/landoftherair/lotr2/commit/c725cb145ed43671d5b45e21c494dd02ce037332))
* **core:** fix dupe login bug ([37d716c](https://github.com/landoftherair/lotr2/commit/37d716c5b2b07f87be1b20c76de40ef72b9d1573))
* **core:** login fubar issue addressed hopefully ([8b2adef](https://github.com/landoftherair/lotr2/commit/8b2adefc591f33e4ad13d4661d29fc3f07a39637))
* **core:** login works better ([cee0562](https://github.com/landoftherair/lotr2/commit/cee05629c2db92091f749442155ecafb2428a5bd))
* **core:** prevent registering while logged in ([bbe9886](https://github.com/landoftherair/lotr2/commit/bbe988626223ecfbf33406c666e02c3d3b0ab4a9))
* **core:** succor cannot go in locker or pouch ([dfd4b1d](https://github.com/landoftherair/lotr2/commit/dfd4b1d93a85a1304dd60b72a974ea09e21d6683))
* **effect:** can no longer remove permanently applied effects (from equipment etc) ([f9002df](https://github.com/landoftherair/lotr2/commit/f9002df307dbe48702252dac11831b08752f5a33))
* **item:** can pick up gold when sack is full ([101afa1](https://github.com/landoftherair/lotr2/commit/101afa1c7c9a419f4f46d139170266c53bba5a90)), closes [#132](https://github.com/landoftherair/lotr2/issues/132)
* **locker:** can no longer locker conjured items ([406a71b](https://github.com/landoftherair/lotr2/commit/406a71b2c6dcf5aa02bc8553732aced971e569d6))
* **locker:** lockers no longer take two items when withdrawing to hand ([0a85171](https://github.com/landoftherair/lotr2/commit/0a85171df1b899f19de27ac7979145a3697b7634))
* **locker:** lockers with a space in the name are removed as they do not work; names must be fixed ([1401d39](https://github.com/landoftherair/lotr2/commit/1401d39ea3399ce2430a9bdd26b249eb805e0df6))
* **npc:** alchemist had incorrect ounce combine value ([39645bf](https://github.com/landoftherair/lotr2/commit/39645bf8e64778fe8f6250fab6286867f5b5570f))
* **npc:** bought items have a fixed sell price so they can't game the system ([70e18b1](https://github.com/landoftherair/lotr2/commit/70e18b14da50f142ea57e68e7f16a2138bafabee))
* **npc:** items with a default sellValue can have CHA bonuses again ([df5beb9](https://github.com/landoftherair/lotr2/commit/df5beb9beb175fc6b4f905cd7a7938bc65de5760))
* **npc:** npc dialog fail should not throw errors if it is not present ([50da180](https://github.com/landoftherair/lotr2/commit/50da1801ff2da90f5e4957b307f58a3ef35266fa))
* **npc:** vendors with alternate currencies no longer can be bought with gold ([6ab6993](https://github.com/landoftherair/lotr2/commit/6ab69937fed7c476e2b0311ee627bdaf043ee092))
* **pouch:** conjured items do not fit in pouch ([b0ca635](https://github.com/landoftherair/lotr2/commit/b0ca6350da62e76ec49205207535a083a36b775a))
* **pouch:** succor items correctly remove from pouch when dragging to ground ([98a489a](https://github.com/landoftherair/lotr2/commit/98a489aabc22aed883a4fc8b6f51e948c8d1d2db))
* **rune:** fix error with runes being screwy if there wasn't anything in the slot before it ([9d472a3](https://github.com/landoftherair/lotr2/commit/9d472a383d4e415ef58a5db4f28e3e672f05b8c9))
* **spell:** ai cannot identify ([76eb73e](https://github.com/landoftherair/lotr2/commit/76eb73e82b11459d99996da2c72ab576d30ca4ba))
* **spell:** channeled spells can't be cancelled because ai are dumb ([d7f8707](https://github.com/landoftherair/lotr2/commit/d7f87071a754f9f63286674bd062132dedc90f7a))
* **spell:** cleave was able to attack anywhere on screen ([23b5579](https://github.com/landoftherair/lotr2/commit/23b557937edb8f1bb4ef3caf027f0a630520c367))
* **spell:** directional spells work again (darkness, firemist, icemist) ([109243e](https://github.com/landoftherair/lotr2/commit/109243e904e17eea8ed6bdab716b3dd8b785a468))
* **spell:** enemies can cast darkness gain ([0945ffc](https://github.com/landoftherair/lotr2/commit/0945ffcf244c6fb8fcb8d47e90912f54ae3ef9bf))
* **spell:** fate should have a min level requirement always ([b691526](https://github.com/landoftherair/lotr2/commit/b69152629964f4259efe6688f8c1e02a0cba8066))
* **spell:** find familiar cancels itself on subsequent casts ([4478fca](https://github.com/landoftherair/lotr2/commit/4478fcaf6da4c49e3ac18a6546ca09f5bd4f0833))
* **spell:** identify should run optional check on callbacks ([108af69](https://github.com/landoftherair/lotr2/commit/108af6966ee4ba72753da4687e0e463a08bfcb57))
* **spell:** lots of attacks directly dealt damage instead of doing a magical attack ([3448c91](https://github.com/landoftherair/lotr2/commit/3448c91cd63dd0d7cab8766a8be51f81ce6be626))
* **spell:** memorize shouldn't say youve been stunned ([22f101a](https://github.com/landoftherair/lotr2/commit/22f101a755d29c7b5fe6a15375bc881758322955))
* **spell:** rift slash should work from any distance ([60a9f9e](https://github.com/landoftherair/lotr2/commit/60a9f9e10f37832110e9e6bc5f8071e9e5495e67))
* **spell:** shadowmeld breaks on any agro generated ([e65ad97](https://github.com/landoftherair/lotr2/commit/e65ad97f589601bef4aa021d83f960db4fb19510))
* **steal:** steal can no longer be used from a distance ([3d12242](https://github.com/landoftherair/lotr2/commit/3d12242b1d5b87547bfbdafed7ed168567fe5443))
* **trait:** stances are now canceled when resetting traits ([dd359c6](https://github.com/landoftherair/lotr2/commit/dd359c671bc4cbe8b01b88c90fb415c014415ae2))
* **ui:** '.' to repeat last command should not be stored in history ([3f999fa](https://github.com/landoftherair/lotr2/commit/3f999fac222d777222a3292d1bfd2bd13c8e3d44))
* **ui:** add nice popup for no teleport locations memorized ([89dcf8b](https://github.com/landoftherair/lotr2/commit/89dcf8b6021b2c35d2bd82e9366b42dce67c0498))
* **ui:** auto join would not scroll lobby down all the way ([b4c1a07](https://github.com/landoftherair/lotr2/commit/b4c1a075ce8ccff345b1d3e2bc08517dd5d2c8f5))
* **ui:** bank would sometimes ignore you having 0 gold and say nothing ([63ba195](https://github.com/landoftherair/lotr2/commit/63ba1951c65ca50ed1bff6aa449875b20ba6f3d5))
* **ui:** command line toggle enter was being screwy ([469c81b](https://github.com/landoftherair/lotr2/commit/469c81b439a489f92729243af6d76f991022661d))
* **ui:** dark should work correctly now ([1dbd9b6](https://github.com/landoftherair/lotr2/commit/1dbd9b6f083e6d41d27040e95bcfd7f0bb1eea47))
* **ui:** disable login/register if no server connection ([3e73489](https://github.com/landoftherair/lotr2/commit/3e73489241c73b3ac6832c218d0520de1478b232))
* **ui:** enter toggles the cmd focus again ([f45dc1c](https://github.com/landoftherair/lotr2/commit/f45dc1cdc8e848e8c818f50740f906686f58d579))
* **ui:** error when trying to show coin but assets not loaded ([829a0e2](https://github.com/landoftherair/lotr2/commit/829a0e23ddf0ae264a05ef95fb76c03a0f25e4ea))
* **ui:** fix autologin ([714f75b](https://github.com/landoftherair/lotr2/commit/714f75bfd435e95227334e87feabe0d029ec8071))
* **ui:** fix jittery macro bar picker ([6bf6cf9](https://github.com/landoftherair/lotr2/commit/6bf6cf994cfdd5d3b348b40c9f515f21b168c474))
* **ui:** fix npc dialog ([9a1b667](https://github.com/landoftherair/lotr2/commit/9a1b6672e4ce11f75853efaff52ebafc42c73c42))
* **ui:** if event has no stats, dont show the stat area ([2e15123](https://github.com/landoftherair/lotr2/commit/2e15123d6286fa0a714ce4e4ebf3e85ce08706f6))
* **ui:** improve command line toggle interaction ([515b72b](https://github.com/landoftherair/lotr2/commit/515b72b0aa622686a7edb71cece4a61bb54d9d45))
* **ui:** improve performance of equipment component ([3b6a4d2](https://github.com/landoftherair/lotr2/commit/3b6a4d2dd68670859fc4fd9b9cfeb34dbe887bfb))
* **ui:** king sprite would not show up in modals since it was id 0 ([0ff18fa](https://github.com/landoftherair/lotr2/commit/0ff18fae9eec9cde00b89da30c09c692aba1a431))
* **ui:** remove alignment from ui ([07b0bf9](https://github.com/landoftherair/lotr2/commit/07b0bf9f980bfd357b251511b8e546172df0819c))
* **ui:** sort options should be null by default, not false ([ad52a72](https://github.com/landoftherair/lotr2/commit/ad52a720e347406fe0358cbfc3c8b9834a2c2c93))
* **ui:** terrain needs to be a png instead of webp ([f51953b](https://github.com/landoftherair/lotr2/commit/f51953b106a5f2bfa30a1f01a423b509170370db))
* **ui:** ui arg parsing was incorrect for directionals ([e1532f6](https://github.com/landoftherair/lotr2/commit/e1532f6353d0b9189a8f15074235669a62da6951))


### Features

* **ai:** add damageTaken proc for ai; add training dummy ([6d6d705](https://github.com/landoftherair/lotr2/commit/6d6d705833d8c93056f60c94cc238937ffe89d42))
* **boss:** add crazed sedgwick ai ([4262628](https://github.com/landoftherair/lotr2/commit/4262628ec808673cab30e02384fe9bfdfe85bece))
* **command:** add popup for forgetting ([b6957ff](https://github.com/landoftherair/lotr2/commit/b6957ffaaeb028bddc8aaeb314847f23e99cc027))
* **command:** mug now will not work with a 2h weapon ([a7e3f9a](https://github.com/landoftherair/lotr2/commit/a7e3f9a5a8450c399580da79036526ac1eeb1158))
* **core:** add db indexes ([027573c](https://github.com/landoftherair/lotr2/commit/027573cf9eaea645c985e11ba64500a8a5201a7f))
* **core:** add threat multiplier stat ([cc0b8aa](https://github.com/landoftherair/lotr2/commit/cc0b8aa438e1778636efb898ba8c7e939321141a))
* **core:** can go past map skill cap slowly ([fd257c5](https://github.com/landoftherair/lotr2/commit/fd257c59aaba9855bca7f00d3ca478051bdce103))
* **core:** map no longer limits xp ([9a49926](https://github.com/landoftherair/lotr2/commit/9a49926f55cc371b45803176ee0aa0a321ee82ed))
* **effect:** add remaining effects ([ad6a322](https://github.com/landoftherair/lotr2/commit/ad6a3220114ccba696982e980450f8fc8018e6f8))
* **events:** add dynamic event system ([edbaa1d](https://github.com/landoftherair/lotr2/commit/edbaa1d864ff872d8c8f53d6f4da09ea3375f7da))
* **gm:** add examine creature command ([f1abe1d](https://github.com/landoftherair/lotr2/commit/f1abe1d88f10bd5fc1b2dbe4ef078d5606681390))
* **lair:** add crazed tonwin ([0bccc00](https://github.com/landoftherair/lotr2/commit/0bccc001aa9f04d31b2638d65d72734b3fd574db))
* **lair:** add ranata ([e6e5f31](https://github.com/landoftherair/lotr2/commit/e6e5f3157be5171bb2f6ae1be7ff8a0facd2e770))
* **npc:** add npc sending messages in combat ([8e020c1](https://github.com/landoftherair/lotr2/commit/8e020c13035e282ee0508bf4cc00cb29c21338cf))
* **npc:** added invulnerable npc effect ([937226a](https://github.com/landoftherair/lotr2/commit/937226a9c801a7eaae436b0e3a9d8b5d2249023d))
* **npc:** green npcs now respawn faster ([fe69f38](https://github.com/landoftherair/lotr2/commit/fe69f3889689456ead183b912918041c0c2b92c8))
* **npc:** npc dialog can now check for no item in hand ([a540f31](https://github.com/landoftherair/lotr2/commit/a540f3160112a9accb0a281cc613f013ac93bdea))
* **quest:** quests can now reward reputation ([eb8e47c](https://github.com/landoftherair/lotr2/commit/eb8e47c15c4cc99d0d7e7f2e073625ea2e59270f))
* **skill:** add basic monster skills ([6fcb5cf](https://github.com/landoftherair/lotr2/commit/6fcb5cfc3330b4ae55231c022a029b3a1a9a626b))
* **skill:** add frost dragon bite; fix chill bites ([6b14fda](https://github.com/landoftherair/lotr2/commit/6b14fda6be70c79cb5e365350a9f4971e53f6f2a))
* **spell:** add reincarnate ([393549a](https://github.com/landoftherair/lotr2/commit/393549ad6ca65f6110d9cf9fa8f5545b189ddb9d))
* **spell:** can right click cancel songs ([4a721b6](https://github.com/landoftherair/lotr2/commit/4a721b602ec45d3cc8333b5d842bbe1da89af8d5))
* **spell:** charge is granted by default to all players ([6f9990d](https://github.com/landoftherair/lotr2/commit/6f9990df8ffc01580fc5d699060b09772388cb80))
* **spell:** stances can be cancelled by recasting ([33a85f5](https://github.com/landoftherair/lotr2/commit/33a85f5f6fe6ae3987ffab8009335451f053c04f))
* **spell:** teleport pops up a menu ([f1a087b](https://github.com/landoftherair/lotr2/commit/f1a087bf527d775a2174d731340429c263d5e812))
* **trait:** add familiar fists ([1783036](https://github.com/landoftherair/lotr2/commit/1783036202853d2c3a0a4afb4436e1e483858eba))
* **trait:** add familiar fortitude ([ccc87ad](https://github.com/landoftherair/lotr2/commit/ccc87ad25f47b3c089994084ef3df2c2d1e7fc6e))
* **trait:** add familiar strength ([5f27ace](https://github.com/landoftherair/lotr2/commit/5f27acef69e28cd099d4c28ea4ae8bcf84ad49e2))
* **trait:** add holiday traits ([b05b1e7](https://github.com/landoftherair/lotr2/commit/b05b1e7a11fb50d1fb32f38ce09cba81bce17452))
* **trait:** added defensive voice, shielding voice, reflecting voice ([2895fee](https://github.com/landoftherair/lotr2/commit/2895feeea7d7e626ad21feba176510267515863d))
* **ui:** add 'dont attack grey' option, on by default ([ab6698c](https://github.com/landoftherair/lotr2/commit/ab6698c17a05de9a609982fb7a318421d038005e))
* **ui:** can now verify and change your email ([aceea2c](https://github.com/landoftherair/lotr2/commit/aceea2c057b6c3b0b3f6816140237df7a858c004)), closes [#124](https://github.com/landoftherair/lotr2/issues/124)
* **ui:** can request a temporary password for logging in ([4dd42be](https://github.com/landoftherair/lotr2/commit/4dd42be261cd2187b0b24d5051c6ef8a2f334aef))
* **ui:** even if healer cannot train you he will offer to recall you ([b2798be](https://github.com/landoftherair/lotr2/commit/b2798beeda845728af9cd41fd680e18bfaaf8d1b))
* **ui:** healer trainer will offer to recall if you talk to him ([d046627](https://github.com/landoftherair/lotr2/commit/d046627fdab1ed64ced79afa4aafcd8246dbae01))
* **ui:** highlight stairs and doors ([562373a](https://github.com/landoftherair/lotr2/commit/562373aaf451fd8fee8391115e0e11fc69aec308)), closes [#67](https://github.com/landoftherair/lotr2/issues/67)
* **ui:** server can now request input directly from client; add memorize popup ([6a35619](https://github.com/landoftherair/lotr2/commit/6a356199cb3278ca432df40f1fa49305a3f93ec3))
* **ui:** use webps for all spritesheets to reduce size significantly ([412b959](https://github.com/landoftherair/lotr2/commit/412b95910aad2812597d346e8d19dddd8d63b427))
* **ui:** validation codes have a limited number of attempts and expire after an hour, closes [#137](https://github.com/landoftherair/lotr2/issues/137) ([6850ce7](https://github.com/landoftherair/lotr2/commit/6850ce774e2cdfa67e520a6531ef327943b9ccdc))
* **world:** add tower of selen ([05e42da](https://github.com/landoftherair/lotr2/commit/05e42da46e04450a9484345cf542bc4d4e6e7296))



## [1.12.5](https://github.com/landoftherair/lotr2/compare/v1.12.4...v1.12.5) (2021-04-23)


### Bug Fixes

* **combat:** NaN damage will no longer reduce health to 0 ([2120891](https://github.com/landoftherair/lotr2/commit/21208919a5b2773d760be5e099a5fa6225cf100a))
* **combat:** offhand attacks only happen if you have a righthand item ([8066152](https://github.com/landoftherair/lotr2/commit/80661527d2751746aca84a8d1b26c799a24ead7d))
* **combat:** remove double check for shadow swap ([af749e7](https://github.com/landoftherair/lotr2/commit/af749e7e9ce561d45e900985927d7735d384f816))
* **core:** cannot sell items worth less than 10 gold ([2419098](https://github.com/landoftherair/lotr2/commit/241909835986098445c8bd5c851565b030ffe4bd))
* **core:** fix phaser typedefs ([5143909](https://github.com/landoftherair/lotr2/commit/514390952eb176ba458ff37316604f51499d9bfa))
* **core:** healer/mage starts with more mp ([61e4289](https://github.com/landoftherair/lotr2/commit/61e42890db642fef525ca0d60d968bbdf6de106d))
* **core:** map is technically nullable ([3f1f022](https://github.com/landoftherair/lotr2/commit/3f1f0225f4be0172aec8c68ecc7bf51d0ccc8ef7))
* **core:** spell effects that are permanent should not be able to be recast on you under any circumstances ([683d770](https://github.com/landoftherair/lotr2/commit/683d7703b05f9bad2a7f098256c430746869bc3c))
* **spell:** make venom and poison longer ([2fcc9c4](https://github.com/landoftherair/lotr2/commit/2fcc9c4e9932ca196f20c2b9cbf9aef46464924f))
* **spell:** rapidpunch should gain accuracy, not lose accuracy, as it is improved ([9646a9c](https://github.com/landoftherair/lotr2/commit/9646a9c1c98c4a78c507f0f6772085dfa1d23894))
* **spell:** rapidpunch wont work with a weapon in lefthand ([cd7848e](https://github.com/landoftherair/lotr2/commit/cd7848e85747b386b80f33dd9c6bc8c0c8726c8f))
* **spell:** spells that specify a range less than 4 and used directional targetting would allow max range instead of limited ([0e12666](https://github.com/landoftherair/lotr2/commit/0e12666a969a15093ec1207ad16f803908abaf47))
* **targetting:** GM-allegiance players should not be targetted automatically under any circumstances ([9a6c4ab](https://github.com/landoftherair/lotr2/commit/9a6c4abe61e60e56ece1b5e50abc623c5bc3d6ca))
* **ui:** disable right click for movement purposes ([a6a69be](https://github.com/landoftherair/lotr2/commit/a6a69be5d642bca6d2df03016d9fd32927229577))
* **ui:** dont log current command event in history ([d75b8a2](https://github.com/landoftherair/lotr2/commit/d75b8a24190186ca85b4d9b431ba5756040976a2))


### Features

* **combat:** add more variance to early game weapons ([2cc55a9](https://github.com/landoftherair/lotr2/commit/2cc55a9ae95e35565cf7d84d8b490b4f0cb2cc3c))
* **command:** add place command ([33f8115](https://github.com/landoftherair/lotr2/commit/33f81152f58bacb08f376522c7267b2fc00aad9e))
* **command:** add sheathe command ([4289914](https://github.com/landoftherair/lotr2/commit/42899144c2b926a27d1bc3946f88d4ae15fd7330))
* **command:** add take command ([452f53b](https://github.com/landoftherair/lotr2/commit/452f53b1c92c2da13ffe7cb618fe38ca623d5a12))
* **command:** add wield command ([4531e0e](https://github.com/landoftherair/lotr2/commit/4531e0e57e9ccefaac30a07d0e06f8c53bde9542))
* **command:** add write command ([3aad090](https://github.com/landoftherair/lotr2/commit/3aad09080b61945ced1ec4448b1a6d8b487555e0))
* **spell:** add aria of refuge and nightmare serenade ([e75a05f](https://github.com/landoftherair/lotr2/commit/e75a05fc86ec0b5815f28f994f931152ba6d1471))
* **spell:** add backstab ([75e6c0c](https://github.com/landoftherair/lotr2/commit/75e6c0cb85b5ed80a270c6d7d0f228713fab4839))
* **spell:** add blindstrike ([024cf49](https://github.com/landoftherair/lotr2/commit/024cf49bbca26994e08f8d07dd7f5d7e03b0521e))
* **spell:** add blurred vision ([4c7bebb](https://github.com/landoftherair/lotr2/commit/4c7bebb16723d85b687387c6022f6e7eb332330a))
* **spell:** add chain kunai ([3a76db0](https://github.com/landoftherair/lotr2/commit/3a76db07550c7c33121af4093aef9a8df35b702a))
* **spell:** add deadly dirge ([3c2ec4f](https://github.com/landoftherair/lotr2/commit/3c2ec4f5faf8e16f6ee086902dc95031b65456e4))
* **spell:** add debilitate ([b5c002d](https://github.com/landoftherair/lotr2/commit/b5c002d287b2770a8cc723deac7be2f5db3be594))
* **spell:** add disguise ([bbdad8d](https://github.com/landoftherair/lotr2/commit/bbdad8dba706b5dfe1fa52f8e8fd0086faafcff5))
* **spell:** add distraction ([63ce3b3](https://github.com/landoftherair/lotr2/commit/63ce3b3d83ef1350bbff8c8d2c47f22273702f81))
* **spell:** add jumpkick ([468cead](https://github.com/landoftherair/lotr2/commit/468cead7e9830589cfde56fc65b45c95810bec0e))
* **spell:** add multishot ([f6b8560](https://github.com/landoftherair/lotr2/commit/f6b8560b67ff0c111430db8e0e811c58b0bcd84e))
* **spell:** add multistrike ([8c0ed81](https://github.com/landoftherair/lotr2/commit/8c0ed813c9ac05188e554d8513494f21072b0692))
* **spell:** add power ballad and wistful fugue ([80684f0](https://github.com/landoftherair/lotr2/commit/80684f0d8c43437b05f43007475a088261cf2e54))
* **spell:** add rapidpunch ([4ac5b6b](https://github.com/landoftherair/lotr2/commit/4ac5b6bc6d345711a409b0304cf37c7fc9e92a99))
* **spell:** add shadow clones spell ([a36d998](https://github.com/landoftherair/lotr2/commit/a36d998297208d6a3bd07057fcd6aee0fffc2884))
* **spell:** add shadowmeld ([d5fddb6](https://github.com/landoftherair/lotr2/commit/d5fddb689a90ea2fe380f66265ecbe31e6fbcf23))
* **spell:** add shield for warrior ([a1bc38d](https://github.com/landoftherair/lotr2/commit/a1bc38d7329a5588a8a7b34e515205fbf8fdab8e))
* **spell:** add sweep ([50b5387](https://github.com/landoftherair/lotr2/commit/50b5387b19136cb43b510f685415ebfcf758e95a))
* **spell:** add thief apply ([9219e4d](https://github.com/landoftherair/lotr2/commit/9219e4d1c802bcfe445ba82f227f87cd38236e24))
* **spell:** add thruststrike ([770a563](https://github.com/landoftherair/lotr2/commit/770a5637685f50f7f8975d9abb29f0d0abee075d))
* **spell:** add tranquil trill ([85731b4](https://github.com/landoftherair/lotr2/commit/85731b41a81705c57ffea452835b5391a1cc7a69))
* **spell:** add transmute ([015f8bf](https://github.com/landoftherair/lotr2/commit/015f8bfeaa2b964cb1fdcddbf8eb9afaa34073bb))
* **spell:** add trap disarm: ([f84257d](https://github.com/landoftherair/lotr2/commit/f84257dbc9e2786411f419d88bd192df0dde035a))
* **spell:** add trap set, traps, etc ([ce1bece](https://github.com/landoftherair/lotr2/commit/ce1beceab81eccb93663c4106a15d44173d7ebb7))
* **spell:** add turtle and tiger stance ([fbcb0fa](https://github.com/landoftherair/lotr2/commit/fbcb0fac1302c3326d1368e495e161c16ae9a7b8))
* **spell:** add venom ([78ae26a](https://github.com/landoftherair/lotr2/commit/78ae26a8e1628fa05e59cfec8651136a431acc2c))
* **spell:** add vortex; add helper methods to make it less of a pain to update when lots of items change position ([627c92c](https://github.com/landoftherair/lotr2/commit/627c92c3a3fba8eae25f6220b0ad20caf6a0d2cb))
* **trait:** add appraise trait ([6f5c47d](https://github.com/landoftherair/lotr2/commit/6f5c47dfa7a70f9183c4a24267cb95ff54bc5d66))
* **trait:** add better backstab ([4a5af95](https://github.com/landoftherair/lotr2/commit/4a5af95977643cc426c8f6023139e9f04fe79a09))
* **trait:** add brass knuckles ([6ff8b83](https://github.com/landoftherair/lotr2/commit/6ff8b83c9bfed2b07fc108f52774d938a138cd6c))
* **trait:** add consuming rage ([2174e1b](https://github.com/landoftherair/lotr2/commit/2174e1b68a874e3eab890b4a539719a5978af3c8))
* **trait:** add corrosive poison ([889a2e5](https://github.com/landoftherair/lotr2/commit/889a2e5306861906c7dacc969a24dd655203b8ce))
* **trait:** add darkness widen ([d3fe6ba](https://github.com/landoftherair/lotr2/commit/d3fe6ba5365cb8ac4cc1d283d9f1eac4c229a3fd))
* **trait:** add degenerative venom ([40cbb8d](https://github.com/landoftherair/lotr2/commit/40cbb8d8cc976c84ee2259e054ee2d533c8174d0))
* **trait:** add dirge of cerberus ([441787c](https://github.com/landoftherair/lotr2/commit/441787c03c743cfded297cd3f724016a20a7b127))
* **trait:** add double thrust ([d4d76d2](https://github.com/landoftherair/lotr2/commit/d4d76d263f725a6d1701b2a14345ad5f81114aa8))
* **trait:** add enhanced applications ([65c0d76](https://github.com/landoftherair/lotr2/commit/65c0d761b7fffdbaf91aa8c32d65e76f687e2559))
* **trait:** add gentle step ([cef346f](https://github.com/landoftherair/lotr2/commit/cef346fa89b7e9611f6b9e90f183b195b7da9505))
* **trait:** add improved rapidpunch ([e76a9bc](https://github.com/landoftherair/lotr2/commit/e76a9bc5d8deb49d3f3f8f0ff29dc19684c87ef7))
* **trait:** add lockpick specialty ([26a81b1](https://github.com/landoftherair/lotr2/commit/26a81b1b0e76a0925ef92e4d97c3757f04ac1beb))
* **trait:** add martial acuity ([4fc7a9c](https://github.com/landoftherair/lotr2/commit/4fc7a9c5b7e54f81897defd9aa211892321654a1))
* **trait:** add martial agility ([c3be75d](https://github.com/landoftherair/lotr2/commit/c3be75de181f8a10225f7a20ce276405b55bd47a))
* **trait:** add multifocus and multitarget ([a427332](https://github.com/landoftherair/lotr2/commit/a4273323af0a78a95a715c8453f9b658c233a214))
* **trait:** add offensive encore, rework songs to be outgoing, add sonic damage ([b1bdacd](https://github.com/landoftherair/lotr2/commit/b1bdacd4fe7dd416f67922ee36f786140eba3114))
* **trait:** add philosophers stone ([7c1bf68](https://github.com/landoftherair/lotr2/commit/7c1bf6860185107a8aa7f3968cfc70ea566486c8))
* **trait:** add punchkick ([3d87132](https://github.com/landoftherair/lotr2/commit/3d871327a65f161ba6e02ac154c573e208ad5b90))
* **trait:** add reflective coating ([412a631](https://github.com/landoftherair/lotr2/commit/412a6318899168f3edb836f1203b5a34fa9c98aa))
* **trait:** add reusable traps ([db101cf](https://github.com/landoftherair/lotr2/commit/db101cf18b90137efe43cdd862808c9a522731eb))
* **trait:** add shadow daggers ([d8844dc](https://github.com/landoftherair/lotr2/commit/d8844dc726bc334e82cc9a40ae6e6c850c10109f))
* **trait:** add shadow daggers ([593935b](https://github.com/landoftherair/lotr2/commit/593935b9d6c8ad760c2ff0b40affe27e4d235ab0))
* **trait:** add shadow sheath ([9bbc241](https://github.com/landoftherair/lotr2/commit/9bbc2418b294c631bb839eebf26d3eb714674355))
* **trait:** add shadowsong ([468956e](https://github.com/landoftherair/lotr2/commit/468956e4f8ae2125115b977105499c9cf6e8227a))
* **trait:** add strong shots ([9240b68](https://github.com/landoftherair/lotr2/commit/9240b68183f7a6a3029c3bb8bfc5b9f7f53c3282))
* **trait:** add strong sweep ([c00a56d](https://github.com/landoftherair/lotr2/commit/c00a56d9084de38c2f87293fac607f2f042f7e88))
* **trait:** add stronger traps ([c75359b](https://github.com/landoftherair/lotr2/commit/c75359b43420f093f89549a6062e0a448e734a1f))
* **trait:** add stunning fist ([100531d](https://github.com/landoftherair/lotr2/commit/100531d8892c39c13218f202f222d69b812f0ea1))
* **trait:** add thrown traps ([29db5ab](https://github.com/landoftherair/lotr2/commit/29db5ab0e790fbd655f23d7bc263b2e31d56b2a9))
* **trait:** add triple shot ([4febea9](https://github.com/landoftherair/lotr2/commit/4febea9917d895bfef06901a4d655483ae325ded))
* **trait:** add unarmored savant ([09bd2d2](https://github.com/landoftherair/lotr2/commit/09bd2d2f7d41a6722f2674f08c9c5bb5b29f068b))
* **trait:** add wider traps ([f77dd82](https://github.com/landoftherair/lotr2/commit/f77dd826298ecf550f6f351c6f2c51c3c1bcda30))
* **ui:** add option to auto join game with last character slot played; ([36d9c9e](https://github.com/landoftherair/lotr2/commit/36d9c9eb4a8b61030c1918ba2edef776fac23c52))
* **ui:** can assess items at a merchant ([7c148dd](https://github.com/landoftherair/lotr2/commit/7c148dd50128627be42f2ed9021c3f19642c5d38))



## [1.12.4](https://github.com/landoftherair/lotr2/compare/v1.12.3...v1.12.4) (2021-04-16)


### Bug Fixes

* **alchemist:** fix alchemist not checking item names for combine ([074c1b2](https://github.com/landoftherair/lotr2/commit/074c1b226ce5f2278cdc7711ed7718f1a88f8db7))
* **core:** crash fix ([c4dcd29](https://github.com/landoftherair/lotr2/commit/c4dcd292494ea46fc56c0974a33f29e264620199))
* **core:** fix some small crash bugs ([69c6f32](https://github.com/landoftherair/lotr2/commit/69c6f3253f95531b16214a7b9a888b73ae3bf408))
* **core:** register should block usernames with non-alphanumeric characters ([a51b739](https://github.com/landoftherair/lotr2/commit/a51b7397a3267f1cc4ce7897f75c1c7cae12917e))
* **spell:** boost should stun self ([5be650b](https://github.com/landoftherair/lotr2/commit/5be650bfecfd85c4ef52e98cc7d20b63e9b9a070))
* **spell:** conjure spells can only target self ([6e95f08](https://github.com/landoftherair/lotr2/commit/6e95f089bacbe7fc7d7336f6859e233319bf6f59))
* **spell:** conjure sword/shield should work correctly for npcs ([7a79fb1](https://github.com/landoftherair/lotr2/commit/7a79fb1759d129cf6d8d9866b1db6a881d83a490))
* **ui:** add GtK ([a80335c](https://github.com/landoftherair/lotr2/commit/a80335c91e3787b6b73c7a590d27db4a26d4c0ed))
* **ui:** teleport memorize doesnt send stun for some reason, but client shouldnt get errors for it ([0c44abb](https://github.com/landoftherair/lotr2/commit/0c44abb7f38923960fb7bae8e52e7cea6c5f686f))


### Features

* **core:** add helper to roll a trait level value ([2f44b9e](https://github.com/landoftherair/lotr2/commit/2f44b9ee661a0fbfcc663c0d179688efad5a0f3d))
* **core:** spells can now ignore recently if desired, as well as disable apply/unapply messages (useful for stun) ([c0079b8](https://github.com/landoftherair/lotr2/commit/c0079b8a92c296ca4744997e7c10f866182a3e83))
* **spell:** add boost ([886e9d2](https://github.com/landoftherair/lotr2/commit/886e9d265f692e93cd801713c995c53dcb72194e))
* **spell:** add glacier and fire stance ([9585e2e](https://github.com/landoftherair/lotr2/commit/9585e2e5933697310a470a3a8d5b887daf5518a6))
* **spell:** add mocking shout ([37e2bb7](https://github.com/landoftherair/lotr2/commit/37e2bb7d640eca4e92c3fc78ca7276be2171d1f3))
* **spell:** add parrystance/ragestance ([48f3a29](https://github.com/landoftherair/lotr2/commit/48f3a2968341a107be76ee2b3631bb4c05d66fd0))
* **spell:** add provoke ([e509623](https://github.com/landoftherair/lotr2/commit/e50962387eeb7867b1502037f63aac593d207923))
* **trait:** add boosted boost ([e338616](https://github.com/landoftherair/lotr2/commit/e3386167c640d73e8db68d6acdaaced266ca36cd))
* **trait:** add glowing weapon ([0d041c6](https://github.com/landoftherair/lotr2/commit/0d041c61dd148b2c167a5233e353f2568bdc3ac0))
* **trait:** add offhand finesse ([375103f](https://github.com/landoftherair/lotr2/commit/375103f1b1664262c9cf91caafaffa7bdf302c02))
* **trait:** add riposte ([1901566](https://github.com/landoftherair/lotr2/commit/19015669e416b1e3bc5eaa1bad7ff03a35784f8d))
* **trait:** add shieldbearer ([8de73b7](https://github.com/landoftherair/lotr2/commit/8de73b7ab77ff04361623823d6a25c7c1107c2d5))
* **trait:** add sterling armor ([d4f007d](https://github.com/landoftherair/lotr2/commit/d4f007dcb2938cd2fd5b2a7a6b3b5b0361ec3a27))
* **trait:** add strong mind ([0a6dc59](https://github.com/landoftherair/lotr2/commit/0a6dc59bd2403c27b46065fa18c97838a7cbd6a9))
* **trait:** add vicious assault ([1f9aef7](https://github.com/landoftherair/lotr2/commit/1f9aef78261f77823342d2a37ab59988cd75e75c))



## [1.12.3](https://github.com/landoftherair/lotr2/compare/v1.12.2...v1.12.3) (2021-04-09)


### Bug Fixes

* **char:** do not allow spells from traits to be overwritten by non-trait sources ([04ed8c0](https://github.com/landoftherair/lotr2/commit/04ed8c04315c4c4298252af85cadf0863f7a08db))
* **combat:** 0 damage messages will now come in correctly from all sources ([f967740](https://github.com/landoftherair/lotr2/commit/f9677406e4f6abd2f39c96cbb91b7988d80b571c))
* **core:** characters with the same name will not crash the game ([652d24a](https://github.com/landoftherair/lotr2/commit/652d24af72115bde124be3871408f87046c9ac36))
* **crash:** healer trainer restoring a character could sometimes cause a crash ([203a0c4](https://github.com/landoftherair/lotr2/commit/203a0c47912fb533977ea100fcad790b170cccf5))
* **crash:** stealth check somehow triggers with an empty character ([aaa610e](https://github.com/landoftherair/lotr2/commit/aaa610e21ec2c033106e12b367623c902387b43e))
* **npc:** identify npc always has a high tier set unless the npc says otherwise ([aa9439d](https://github.com/landoftherair/lotr2/commit/aa9439d3a9b73a94b30e8c7dea58b2527355b144))
* **party:** aoe attacks will no longer hit party members ([5a4d344](https://github.com/landoftherair/lotr2/commit/5a4d344443b852d17827f3c0ab044d6d80236309))
* **party:** when joining a party, your agro with party members is cleared ([6f1ea6a](https://github.com/landoftherair/lotr2/commit/6f1ea6a4b43c5f33a7d0873f7f453fa0e89ec6d4))
* **spell:** aoe spells should now target correctly; enemies and players are always hostile to each other by default ([9a34b45](https://github.com/landoftherair/lotr2/commit/9a34b455a214e6c89c472a2322bf0c90c55e908c))
* **spell:** conjured sword should start at tier 1 ([b5e0eef](https://github.com/landoftherair/lotr2/commit/b5e0eef9c48accaa97318ea53237195a09a2ac5d))
* **spell:** findfamiliar spells should scale off different stats ([b87d6b1](https://github.com/landoftherair/lotr2/commit/b87d6b19cbf7c6730e1dadc0eebac512a8525ebf))
* **spell:** plague should only spread to targets without it ([7275c5a](https://github.com/landoftherair/lotr2/commit/7275c5aa0d3093186380041a4c80f62fdef66c5d))
* **spell:** push should moveWithPathfinding to do a visual update ([9272c94](https://github.com/landoftherair/lotr2/commit/9272c94cd97f0635c3d64ba0d4123cc3220da203))
* **ui:** all messages should be the most important ([b3714df](https://github.com/landoftherair/lotr2/commit/b3714df3092183c10e4e0448e69048ad0bee5745))
* **ui:** can no longer cast disabled spells ([242575e](https://github.com/landoftherair/lotr2/commit/242575e7d576d04e32b27864c137d227666bfdbd))
* **ui:** creating a character will now properly set the entry in the macro menu ([16be770](https://github.com/landoftherair/lotr2/commit/16be7708ea419cae1bdf31c4639ee9672915c412))
* **ui:** disable text select on trait window ([363070a](https://github.com/landoftherair/lotr2/commit/363070aaf1fb05b1ef63399952ee371d0ea764be))
* **ui:** fix trait window again to have static height traits ([e74220f](https://github.com/landoftherair/lotr2/commit/e74220f4f6aad4d580374c55b40b4e9685aa2fa1))
* **ui:** leave button wasnt visible to anyone but party leader ([dd66c8d](https://github.com/landoftherair/lotr2/commit/dd66c8d227f93a336d7ad4cd0b20cdb10d0940ea))
* **ui:** no more above/below text for char cards ([cb829d4](https://github.com/landoftherair/lotr2/commit/cb829d4f45d3f92e96a7f3d99ac19770983e8db9))
* **ui:** npc chatter window should _only_ be for npc chatter ([9c9af67](https://github.com/landoftherair/lotr2/commit/9c9af674f02af5c4834f0a774579babb201a6f25))
* **ui:** resize trait window to accomodate bottom row ([e7be0cf](https://github.com/landoftherair/lotr2/commit/e7be0cfac96d10c8d07e80bf794bc2b00b2bc728))
* **ui:** trait window needs to be a bit bigger ([43e6480](https://github.com/landoftherair/lotr2/commit/43e648041adfe14999342fe018a998b360cff250))


### Features

* **core:** add spell reflect stat ([8ce5219](https://github.com/landoftherair/lotr2/commit/8ce5219a6943e5f5caa1ee47bf2589005b043270))
* **core:** outgoing effects will be handled post-damage ([9975141](https://github.com/landoftherair/lotr2/commit/9975141e224476bfe275c73bee871418f1dcc5d9))
* **core:** some spells cannot be reflected ([481b81a](https://github.com/landoftherair/lotr2/commit/481b81a9b74629211b7ed40d0c191ef7b33ff9ee))
* **core:** upgrade effect creation to handle removable of similar effects ([8c8975c](https://github.com/landoftherair/lotr2/commit/8c8975c06ae125910b180b921cbbe260dba449c1))
* **npc:** npcs can now cast spells on friendlies ([a9d4df2](https://github.com/landoftherair/lotr2/commit/a9d4df2cc9403cce5628d502d9534f638434eb22))
* **spell:** add antipode ([5354022](https://github.com/landoftherair/lotr2/commit/5354022ee2464d26c72cfbeb706ae9da8dad5577))
* **spell:** add augury ([8103a01](https://github.com/landoftherair/lotr2/commit/8103a012d356ff6ad0c70629bd9f929214f8b230))
* **spell:** add autoheal ([a219078](https://github.com/landoftherair/lotr2/commit/a2190789bf5fe6ad9d03a5b03b9695e64a9e916b))
* **spell:** add conjure sword/shield ([441abf0](https://github.com/landoftherair/lotr2/commit/441abf0c702c6b0e75bb1a84f7f3a5de6a7c2d6a))
* **spell:** add energywave; fix aoe targetting for spell meta ([402d5c5](https://github.com/landoftherair/lotr2/commit/402d5c5129ec7eafce2274c521fea7262c06dd1e))
* **spell:** add findfamiliar, 9 familiars, traits for mage/healer ([42a4abf](https://github.com/landoftherair/lotr2/commit/42a4abf42dfac0b0640836fd2671dfd977670978))
* **spell:** add firemist/icemist (no vfx) ([b80ee00](https://github.com/landoftherair/lotr2/commit/b80ee002da84fd0c2e81d0ad2f2653b39720dfb1))
* **spell:** add firethorns and frostspikes ([8bd9087](https://github.com/landoftherair/lotr2/commit/8bd9087524a4bd4529f0f84ebfb7cfedb9cc4845))
* **spell:** add imbue frost, flame, energy ([7a0b5a2](https://github.com/landoftherair/lotr2/commit/7a0b5a28b7f0305ed8c40c353e9d78c60a729e6d))
* **spell:** add invisibility. truesight update to see invis ([9c21aa7](https://github.com/landoftherair/lotr2/commit/9c21aa79258a5119c89bd997e721742258f10e4d))
* **spell:** add magic mirror ([2e5e8bb](https://github.com/landoftherair/lotr2/commit/2e5e8bb5826486c2387d5ea8b083f1d4074e2d5f))
* **spell:** add plague ([fb68675](https://github.com/landoftherair/lotr2/commit/fb686758005e744faba45c70a73a17dca1aa8445))
* **spell:** add rift slash ([02fafcc](https://github.com/landoftherair/lotr2/commit/02fafcca8b3cc0f23c1343d7273cbd7b245071e5))
* **spell:** add teleport, massteleport, teleport trait, memorize, forget ([e25347c](https://github.com/landoftherair/lotr2/commit/e25347c539b91360b2bac455123d8d3f436edc7e))
* **spell:** allow for aoe widening traits; add energywavewiden ([13eec35](https://github.com/landoftherair/lotr2/commit/13eec3534a0e6e5f8253adf6aa0420281dc1136f))
* **spell:** begin supporting generic location targetting for aoe spells (leads into directional casting down the line) ([f32232e](https://github.com/landoftherair/lotr2/commit/f32232e72c6bdd5b2b66ae101747a69b03d1eefa))
* **spell:** conjure sword will fill left hand if empty ([7c43f0d](https://github.com/landoftherair/lotr2/commit/7c43f0de532b537a74ec7c970363486526d6e6cf))
* **stat:** add physical and magical damage reflect stats ([cb36017](https://github.com/landoftherair/lotr2/commit/cb3601770be84d606235f14bd1ce8394eb27cf22))
* **trait:** add asperslash and drainslash ([af03fe9](https://github.com/landoftherair/lotr2/commit/af03fe976ce82084422f3c656a2bb619ee6bc8b4))
* **trait:** add blinding light ([44469b3](https://github.com/landoftherair/lotr2/commit/44469b3405e529f82ba7f76d388c2f62b451a84c))
* **trait:** add bouncing missiles ([f04de75](https://github.com/landoftherair/lotr2/commit/f04de75188dd6fbaefc3258f29a195581246f009))
* **trait:** add concussive bolt ([8965bb7](https://github.com/landoftherair/lotr2/commit/8965bb731542b45577c30d6d5f6d06a39f6fccab))
* **trait:** add contagious plague ([d1decb6](https://github.com/landoftherair/lotr2/commit/d1decb667f8bb01b8a1cb34201305072f380c4a5))
* **trait:** add dazing outlook, irresistible stun ([e520fab](https://github.com/landoftherair/lotr2/commit/e520fabedc1f560ac6bf88aa97257833238c78c8))
* **trait:** add debilitating disease ([c128bde](https://github.com/landoftherair/lotr2/commit/c128bdef0ce31bba69a0fcdb56708021ff5783fe))
* **trait:** add effective supporter ([1fdcc12](https://github.com/landoftherair/lotr2/commit/1fdcc1291e1916b60329a9e847697e74edd65b20))
* **trait:** add forged fire and chilled core ([59709e7](https://github.com/landoftherair/lotr2/commit/59709e73280bc152d561b75c8705faf2a6690b2a))
* **trait:** add lighten armor ([815e0bd](https://github.com/landoftherair/lotr2/commit/815e0bdcf004d1755d8153f86cc07b98015a7e1e))
* **trait:** add missile barrage; add ability for spells to attack multiple times ([ffaa05d](https://github.com/landoftherair/lotr2/commit/ffaa05d7759651eba6edbf6863236e423bf098fe))
* **trait:** implement roots ([a89a26d](https://github.com/landoftherair/lotr2/commit/a89a26daf85104da67913c4e2659f3eac58c36ce))
* **ui:** update menu to have a more indicative design of it being a menu, and cursor pointer on the chip lists ([8c29168](https://github.com/landoftherair/lotr2/commit/8c2916873fc9ec9eab126fa4ed0350b495829323))
* **ui:** vfx can be sent to the client and displayed on the map ([5c17c98](https://github.com/landoftherair/lotr2/commit/5c17c98eec00c5b9b885ab535bfa69de458d35e3))



## [1.12.2](https://github.com/landoftherair/lotr2/compare/v1.12.1...v1.12.2) (2021-04-02)


### Bug Fixes

* **charge:** charge now requires actual weapons ([1943d6f](https://github.com/landoftherair/lotr2/commit/1943d6fdbaf47930e0d34072716aa88742f2b7e9))
* **core:** effects/_hash will properly update so client side can perform better ([bbc7799](https://github.com/landoftherair/lotr2/commit/bbc779991ef167bdde59bc0c35bf126e2f1ff865))
* **effect:** chill debuff will now work correctly ([9590651](https://github.com/landoftherair/lotr2/commit/959065160a1540866309eab27676f79097a0c298))
* **lobby:** sort by username case insensitive ([2bbd247](https://github.com/landoftherair/lotr2/commit/2bbd2471d3466eafb932b249767fa5ae47064854))
* **quest:** quests that seek the same enemy kill should not fight for that npc, you should get credit for both simultaneously ([41cc9d7](https://github.com/landoftherair/lotr2/commit/41cc9d72ec2a921c6c65ec24a1e97a09b3c9d4c1))
* **skill:** can gain thief skill if hidden while spellcasting ([8b6894e](https://github.com/landoftherair/lotr2/commit/8b6894ee6277ea7346ea4750f519a0c6be758077))
* **spell:** magic resist spells work again ([74e3e09](https://github.com/landoftherair/lotr2/commit/74e3e09a2ebb81f652a6ff8e3e24660df34cf960))
* **spell:** make resist traits use internal levelvalue instead of manual modifiers ([10e4590](https://github.com/landoftherair/lotr2/commit/10e4590700eb45f691a8ea1e120627b1c659d862))
* **spell:** use the aoe radius defined in the data instead of hardcoded ([95ca5dc](https://github.com/landoftherair/lotr2/commit/95ca5dcf63600d4b2fb41536396c85238895551d))
* **trainer:** all trainers can now train thievery skill ([c7e5f57](https://github.com/landoftherair/lotr2/commit/c7e5f571705c05fb269e7882932eb771336bb801))
* **trait:** buying traits or looking at trait window with an item that boosted a trait would not allow you to buy that trait in some cases. also, it didnt acknowledge that the number was boosted ([840b849](https://github.com/landoftherair/lotr2/commit/840b84940778cb09944008a9bba32ca1bbc5ea5f))
* **ui:** map should render air tiles on terrain level and strip them out of wall level ([b4f01a4](https://github.com/landoftherair/lotr2/commit/b4f01a43381f6b938877392e99f3871d2f5b8bfc))


### Features

* **spell:** add antidote ([1519895](https://github.com/landoftherair/lotr2/commit/1519895b9fadf6010d9e798af4d17fe00fdcf146))
* **spell:** add buildup heat/chill ([097de75](https://github.com/landoftherair/lotr2/commit/097de75903686cebc64b78076a464a22fd73aa5c))
* **spell:** add darkness/light/darkvision ([2ec593c](https://github.com/landoftherair/lotr2/commit/2ec593c084d23b63dd38e0a5e2069898013c3752))
* **spell:** add dispel and imbue frost (stub, not complete) ([7ef4b36](https://github.com/landoftherair/lotr2/commit/7ef4b3690f590162171483c384312a5d824268be))
* **spell:** add fleet of foot ([e33e7db](https://github.com/landoftherair/lotr2/commit/e33e7dbf68c1c30896d58ea852ac3f4f7e8417a0))
* **spell:** add holyaura ([e149797](https://github.com/landoftherair/lotr2/commit/e149797557f30594a225e146cc70832481c8ad57))
* **spell:** add holyfire ([0aa068e](https://github.com/landoftherair/lotr2/commit/0aa068eccdf8d64a08dde1798cf3dfacaecca08c))
* **spell:** add powerword barfire/barfrost ([c6a0a0e](https://github.com/landoftherair/lotr2/commit/c6a0a0e69281087bfb75f48d7e9d8568ca8fe5a7))
* **spell:** add powerword barnecro; fix powerwords to work in a better way internally ([945df10](https://github.com/landoftherair/lotr2/commit/945df106dfc2e0df74f9cfca84a64f799a98d457))
* **spell:** add powerword heal ([65a8caa](https://github.com/landoftherair/lotr2/commit/65a8caaa2596a3fbd9e5f68a0445399056102a0d))
* **spell:** add push ([f407150](https://github.com/landoftherair/lotr2/commit/f407150f9eeb12e44e0ab7b3178e4b18edad1e2d))
* **spell:** add revive ([8beca90](https://github.com/landoftherair/lotr2/commit/8beca9091b60e78ef99b88b7f8a32d04ebbdbfbc))
* **spell:** add vision/blind ([fd78e2f](https://github.com/landoftherair/lotr2/commit/fd78e2f330cad4d9fbacb8db647469e0791d98f9))
* **spell:** add vitalessence ([8f8970c](https://github.com/landoftherair/lotr2/commit/8f8970c9d43ade55b4a440bf843e34c8ed9ddced))
* **spell:** spells can now be resisted ([192135e](https://github.com/landoftherair/lotr2/commit/192135e73184ad5874095762a53cacc8e8bb9a37))
* **stat:** add spell critical % stat ([7335825](https://github.com/landoftherair/lotr2/commit/7335825dc1c0c85b81e508a35f9c5f852b29f4ef))
* **trait:** add internal fortitude ([10f30c1](https://github.com/landoftherair/lotr2/commit/10f30c1be41c37bf029b2bfbfcf81ce8bedc1c7e))
* **trait:** add necrotic ward ([00eeba8](https://github.com/landoftherair/lotr2/commit/00eeba8b2acdf401c505ae55c1689d86d35a7ef6))
* **trait:** add thermal barrier ([d5bf133](https://github.com/landoftherair/lotr2/commit/d5bf133376034713e863cd0e6c9fe2c877dfa464))
* **trait:** totem and wand specialty ([b6123db](https://github.com/landoftherair/lotr2/commit/b6123db052faab3fccdd72abf6292f2905f7b8f3))



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



