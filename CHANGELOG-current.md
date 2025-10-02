## [2.8.1](https://github.com/landoftherair/landoftherair/compare/v2.8.0...v2.8.1) (2025-10-02)


### Bug Fixes

* **client:** attempt to cache bust icons ([ea1e9aa](https://github.com/landoftherair/landoftherair/commit/ea1e9aadde556ba6bde59747988f9f53d7a0e7f6))
* **client:** support icons as svgs, not fonts ([37d6f52](https://github.com/landoftherair/landoftherair/commit/37d6f5228a7e99dd527d42f8500e3d92ae2e9c8c))
* **core:** tick effects/queue in opposite order ([a652ab2](https://github.com/landoftherair/landoftherair/commit/a652ab2085901b5cb5afee052c4dcd3eb0edcad0)), closes [#533](https://github.com/landoftherair/landoftherair/issues/533)
* **corpse:** player corpses should work as expected now ([a8590cf](https://github.com/landoftherair/landoftherair/commit/a8590cf9f0a17f01e51d56923ec6138d56f55c51)), closes [#523](https://github.com/landoftherair/landoftherair/issues/523)
* **effect:** always hydrate effect timers in hash, too ([7bc9ead](https://github.com/landoftherair/landoftherair/commit/7bc9ead33132aaa2cbe851ea932abbee747d6f56)), closes [#530](https://github.com/landoftherair/landoftherair/issues/530)
* **gm:** [@teleportto](https://github.com/teleportto) should teleport you to a player if they match ([14c5aff](https://github.com/landoftherair/landoftherair/commit/14c5aff714f5043a0878f183d19dd233b6b79ced))
* **lobby:** charselect should have better spacing for class names ([8a20795](https://github.com/landoftherair/landoftherair/commit/8a2079508a8d5aacbadf8e4d156a7b6a297ec057))
* **macro:** macro bar changing should work correctly ([8001b1d](https://github.com/landoftherair/landoftherair/commit/8001b1d2d0131b9880df06cd7e9d309ef310ed7b))
* **math:** fix xp chart gap between 19-20 ([9b67246](https://github.com/landoftherair/landoftherair/commit/9b67246d4c87796cd759304e3609ebc77fd181c7)), closes [#535](https://github.com/landoftherair/landoftherair/issues/535)
* **spell:** berserk should not hit player familiars either ([b592ac4](https://github.com/landoftherair/landoftherair/commit/b592ac4cf29f1141f9bee2a53b0e098a4fa16e69)), closes [#537](https://github.com/landoftherair/landoftherair/issues/537)
* **spell:** dirge and other aoe spells should respect targetting distances exactly ([290f00a](https://github.com/landoftherair/landoftherair/commit/290f00ad609d9b3ee880dea7710ad59c086af798))
* **spell:** succor blobs should be removed from belt properly ([cb641dd](https://github.com/landoftherair/landoftherair/commit/cb641dd2817340e0cf43d254210d199e6aa82efe)), closes [#527](https://github.com/landoftherair/landoftherair/issues/527)
* **spell:** wizard stance will only fight back when damage > 0 ([939fe71](https://github.com/landoftherair/landoftherair/commit/939fe71488d417fbff709aa0f1262daf824187e9))
* **talent:** bouncing throws should not hit other players, hopefully fixed ([bd53d12](https://github.com/landoftherair/landoftherair/commit/bd53d124e661368b7e185701a7fe73ff4af65830)), closes [#531](https://github.com/landoftherair/landoftherair/issues/531)
* **trait:** trait display looks a bit easier to read now ([0661540](https://github.com/landoftherair/landoftherair/commit/066154055557465a9882306cfc59600fa2f5d105))
* **ui:** desc text for an item should say what gem its encrusted with ([1f01ead](https://github.com/landoftherair/landoftherair/commit/1f01ead7dfce8d709831ac483e03ec1cf7fbbb74)), closes [#525](https://github.com/landoftherair/landoftherair/issues/525)
* **ui:** fix gold sprite +4 ([b20d3d0](https://github.com/landoftherair/landoftherair/commit/b20d3d0f91ae1704e2069f21c581f8897cf66f15)), closes [#524](https://github.com/landoftherair/landoftherair/issues/524)
* **ui:** fix rune codex screen ([2e6c6a7](https://github.com/landoftherair/landoftherair/commit/2e6c6a71d6efbd8c3527a6c7c1389e2c4711cb3d))
* **xp:** should not gain xp while dead ([c32d3a6](https://github.com/landoftherair/landoftherair/commit/c32d3a6c6785568cc7e10bea623c2abb600c7358))


### Features

* **berserk:** berserk should retarget if it misses every attack on a target ([08e13b3](https://github.com/landoftherair/landoftherair/commit/08e13b345a918bff2a63359f7e2f9e4a831e446a)), closes [#539](https://github.com/landoftherair/landoftherair/issues/539)
* **death:** when holding a player corpse, their rot timer will pause ([f6f531c](https://github.com/landoftherair/landoftherair/commit/f6f531c224df274f740a091b183874c8aedf8be1)), closes [#521](https://github.com/landoftherair/landoftherair/issues/521)
* **game:** add sekret project ([21d83b7](https://github.com/landoftherair/landoftherair/commit/21d83b73b4698bb14621b02adb7b432f2a44043c)), closes [#485](https://github.com/landoftherair/landoftherair/issues/485)
* **gm:** add support for [@exi](https://github.com/exi) showing the item definition ([8a31aa5](https://github.com/landoftherair/landoftherair/commit/8a31aa50c6c6c4999e0c4735b759811989630955)), closes [#5344](https://github.com/landoftherair/landoftherair/issues/5344)
* **macro:** utilize macro 'for' ([98b58f9](https://github.com/landoftherair/landoftherair/commit/98b58f93fcd788b54f878b854e286398b5a312b5))
* **meta:** add modkit metadata to client build process ([2023541](https://github.com/landoftherair/landoftherair/commit/20235411a0d11645a0a86ad2828ffd252e8911bd))
* **npc:** encrusters now cost gold ([7c43c4a](https://github.com/landoftherair/landoftherair/commit/7c43c4ab6f114154937764a3b145265177cc5295))
* **skill:** add berserk skill & its many modifiers ([db8323e](https://github.com/landoftherair/landoftherair/commit/db8323e6f800f17bc0dcee599e21f1ccaeeb4870))
* **skill:** add pounce ([a60ce71](https://github.com/landoftherair/landoftherair/commit/a60ce717521b4f81f54af2730bcc068f1c8a0b1d))
* **skill:** add sonic roar skill 519 ([e65a45d](https://github.com/landoftherair/landoftherair/commit/e65a45d95f49e825a5f3e8b76ca6f7358ae38041))
* **spell:** add chromatic bolt ([f2df292](https://github.com/landoftherair/landoftherair/commit/f2df292fc4aa123fa0bf44b78e82df2d48733066))
* **spell:** gemsense will sense gems encrusted into items ([306af16](https://github.com/landoftherair/landoftherair/commit/306af167b9e772be323dd3c8c9c15f881692c5e4)), closes [#525](https://github.com/landoftherair/landoftherair/issues/525)
* **spell:** provoke now sets lasttargetuuid ([64ed21d](https://github.com/landoftherair/landoftherair/commit/64ed21d93e2afa36699552ba8e600a7c7d5d8e26)), closes [#539](https://github.com/landoftherair/landoftherair/issues/539)
* **spells:** add sfx to berserk and revive ([5ea3909](https://github.com/landoftherair/landoftherair/commit/5ea3909fd1fff5b33b66fe3add7ae625f688594e))
* **trait:** add extended range trait ([97105cf](https://github.com/landoftherair/landoftherair/commit/97105cfd743d0b28cba0a274ea7a238b32445c13)), closes [#539](https://github.com/landoftherair/landoftherair/issues/539)
* **trait:** add thundering strikes ([bdedf85](https://github.com/landoftherair/landoftherair/commit/bdedf854fbc15ed504b6f120b2791be92a73ac39)), closes [#539](https://github.com/landoftherair/landoftherair/issues/539)
* **ui:** add asset hashes export ([b1fb290](https://github.com/landoftherair/landoftherair/commit/b1fb2908a4e4701cb343dfa526c166a46eecbf48))
* **ui:** add clear cache/reload options ([6b03b11](https://github.com/landoftherair/landoftherair/commit/6b03b1152d3b22fcf2bc64c74008880e8248cb1e))
* **ui:** load icons as a big bundle ([e110bf2](https://github.com/landoftherair/landoftherair/commit/e110bf28f8018849d6fce82f89c3cc4237ab0a15)), closes [#541](https://github.com/landoftherair/landoftherair/issues/541)



