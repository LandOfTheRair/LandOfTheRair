## [1.3.3](https://github.com/landoftherair/lotr2/compare/v1.3.2...v1.3.3) (2020-11-30)


### Bug Fixes

* **combat:** auto attack would send too many inputs over time, causing issues ([d7cc934](https://github.com/landoftherair/lotr2/commit/d7cc93410099572317fdab74988c836c2248031c))


### Features

* **character:** all characters regen on a 5 second tick instead of 1 second ([e867a4c](https://github.com/landoftherair/lotr2/commit/e867a4cd9fcb4780e086a429eb121fbdc5d19798))
* **combat:** not seeing someone removes them as an active target ([86480a5](https://github.com/landoftherair/lotr2/commit/86480a5e21c01663cc1b5466f857207826af6892))
* **core:** actions are now queued client-side and flushed every 100ms. there is a server side limit of 5 commands per 100ms or subsequent commands get dropped ([4186085](https://github.com/landoftherair/lotr2/commit/4186085942481f84486ff7cd9ec9308be7da1d62))
* **macros:** learning new macros will allow you to select bars to put them into ([1f40041](https://github.com/landoftherair/lotr2/commit/1f40041e5d6fab52931dcb567e13710d575b4401))
* **vendor:** show how much currency you have to spend in vendor window ([176e909](https://github.com/landoftherair/lotr2/commit/176e90932355e5e0ed9e759e928252265c891119))



