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



