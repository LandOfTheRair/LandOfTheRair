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



