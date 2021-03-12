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



