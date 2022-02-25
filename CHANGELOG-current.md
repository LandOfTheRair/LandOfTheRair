## [2.1.6](https://github.com/landoftherair/lotr2/compare/v2.1.5...v2.1.6) (2022-02-25)


### Bug Fixes

* **core:** change antipode hit message ([5c09b0b](https://github.com/landoftherair/lotr2/commit/5c09b0b1ba7ca79bb7e7ebc0963d52868748f5eb))
* **core:** fix iteration over lockers for removing invalid items ([6cc27a9](https://github.com/landoftherair/lotr2/commit/6cc27a92c46acc7dabf6e6b23de7c4c731d61788))
* **core:** improved messaging for case when spellData is not findable for a spell ([7640cc5](https://github.com/landoftherair/lotr2/commit/7640cc5ce07f46f39d58a72c7cf9f9b0239ca84e))
* **core:** only engage in combat when damage > 0, otherwise don't play combat music ([e3b67a4](https://github.com/landoftherair/lotr2/commit/e3b67a4a4a4816a1cc6280a71be7e26b68f1012b))
* **core:** refactor getPotency to spellManager (off from Spell) so it can be accessed externally ([808d6a4](https://github.com/landoftherair/lotr2/commit/808d6a4d7a4925ac1e4e2336392adadce23f0bef))
* **core:** refactor player map state refreshes; refresh map state on revive ([9640e11](https://github.com/landoftherair/lotr2/commit/9640e116272db1f553d75c43e9430c49d80335d8)), closes [#268](https://github.com/landoftherair/lotr2/issues/268)
* **core:** remove invalid items when logging in to a character to prevent invalid items from persisting ([eba7d70](https://github.com/landoftherair/lotr2/commit/eba7d7079620bedad61b42a5ee27e8b5503ef83a))
* **core:** require lefthand to throw for lefthand throwing to work ([2c8fd04](https://github.com/landoftherair/lotr2/commit/2c8fd045a06155f099d980caeded689243edc771))
* **core:** support spells can now be cast on other players regardless of if they're hostile with you or not ([e43a870](https://github.com/landoftherair/lotr2/commit/e43a87097265ae83c8b6458573fdef70b47b2068))
* **spell:** cleave requires a right hand item now ([38c3e5b](https://github.com/landoftherair/lotr2/commit/38c3e5b781990e4fb241c4564c572ea09105af10))
* **spell:** stances can no longer stack, imbues can - different logic paths for each type of allowed stacking where some are buffs and some are stances ([65ce891](https://github.com/landoftherair/lotr2/commit/65ce8910cd76d8afe0c6b9e8e467c889f310b95d))
* **spell:** teleport now triggers a full update when you do it, which should reload npcs ([d11044b](https://github.com/landoftherair/lotr2/commit/d11044bdc66a0aa89a68387f22c998d800631a96)), closes [#258](https://github.com/landoftherair/lotr2/issues/258)
* **tradeskill:** tradeskills will correctly take only the right number of ingredients from the locations they choose ([f6f8535](https://github.com/landoftherair/lotr2/commit/f6f85351e40d5b39aa225a3fe4cef7a9f12173ec)), closes [#279](https://github.com/landoftherair/lotr2/issues/279)
* **trait:** clear encumberance if you select lightenarmor, adjusting a weird case ([17c8b88](https://github.com/landoftherair/lotr2/commit/17c8b8896e17944b97bfd743b288c77f0f981049))
* **trait:** unarmored savant bonus is halved if you're holding a weapon ([79d23f3](https://github.com/landoftherair/lotr2/commit/79d23f3e6e2c68778ac365b9199c30930a98f828))
* **ui:** fix tooltips sometimes not showing all information in some cases, like darkvision helm ([4a12bb3](https://github.com/landoftherair/lotr2/commit/4a12bb348010fb39f956671f53a4a68ed74c2267))
* **ui:** macros that reference a default command with their  will no longer be disabled ([3cce01a](https://github.com/landoftherair/lotr2/commit/3cce01af5c5dbb44294bed1a5b574cdef18b0855))
* **ui:** move tile conversion maps to content and out of hardcoded in client ([e2015ea](https://github.com/landoftherair/lotr2/commit/e2015ea68905c0f95a09d27e5bafe366bcf53d30))
* **ui:** stop messages from building in localstorage potentially crashing or lagging the game load process ([fcd6e5e](https://github.com/landoftherair/lotr2/commit/fcd6e5e227314f578127d83af93f55a7abd3b78f)), closes [#313](https://github.com/landoftherair/lotr2/issues/313)


### Features

* **command:** add new face command. takes a cardinal dir, faces your character in that direction. sitting at tables has never been easier! ([2501f73](https://github.com/landoftherair/lotr2/commit/2501f73752029d079de4f2a2b3690420de6362db))
* **core:** support loading mods at launch time by name; api auto updates ([dc07ff9](https://github.com/landoftherair/lotr2/commit/dc07ff9d997f2c0897aeb9d4cbf7a25a49e787ec))
* **macro:** expand 'for' selection for macros; allow de-selection of a type if inferred incorrectly or undesired ([7d5d032](https://github.com/landoftherair/lotr2/commit/7d5d032e4a7e2503991b5b9ac1c02158c991556b))
* **macro:** support \$first, \$random, \$strongest, \$weakest, ([6d4f02e](https://github.com/landoftherair/lotr2/commit/6d4f02e25d87b5f5df6dd8d43aac40e0654e9869))
* **npc:** add ability to send banner messages to players; add banner messages to all existing AI bosses ([a4c9bc6](https://github.com/landoftherair/lotr2/commit/a4c9bc65d3226d95e28a54845b5f4f1626c6833b))
* **npc:** humanoid npcs will spawn with potions sometimes, and use them sometimes ([a3abcc0](https://github.com/landoftherair/lotr2/commit/a3abcc049ab4c8572192f29fe1ce62bd2b18463a)), closes [#154](https://github.com/landoftherair/lotr2/issues/154)
* **npc:** npcs can now spawn with random buffs ([b49f84d](https://github.com/landoftherair/lotr2/commit/b49f84d6b0762714f8d637373764bc7424da742e))
* **spell:** add energy damage buildup/burst. stuns, removes some buffs, lowers ac/wil by 50%, increased magical damage by 10% ([9f5cae8](https://github.com/landoftherair/lotr2/commit/9f5cae86f2f86e9f649fc7c003927447f2224220))
* **spell:** add fear spell; add to ghost instead of stun ([df27897](https://github.com/landoftherair/lotr2/commit/df2789749b96f78d6074578065d2cebc200f3f7b))
* **spell:** add mad dash, an opener to generate rage for warriors ([694f00a](https://github.com/landoftherair/lotr2/commit/694f00a2489bf625f37a3e9114b07964b37d6ed1))
* **spell:** add ragerang for throw warriors ([be2057c](https://github.com/landoftherair/lotr2/commit/be2057cde26b0c612c5d886653794436f9abac9a))
* **spell:** add wizard stance ([7fb71f9](https://github.com/landoftherair/lotr2/commit/7fb71f9c4b14346977a1fa3d270e7a91f1b90a13))
* **spell:** if in a stance, and imbued with the corresponding element, you will unleash a matching spell (if known) instead of raw damage ([1a598b5](https://github.com/landoftherair/lotr2/commit/1a598b57055364e51d0891283ccf7ac10889a4b0))
* **trait:** add bouncing shot for thieves ([d981afb](https://github.com/landoftherair/lotr2/commit/d981afb767c01deae8c3805fbb3ba01a8d261fa9))
* **trait:** add deep cuts - 10% chance for cleave to add a bleed ([d08267c](https://github.com/landoftherair/lotr2/commit/d08267ce505eb939ad064d2fc93574d55e198a4b))
* **ui:** add 'last session stats' menu on exit to lobby ([d229589](https://github.com/landoftherair/lotr2/commit/d229589ed9e3377145b039a9890d457c6615d344))
* **ui:** add effect name to class surrounding effect for customization ([1ba181b](https://github.com/landoftherair/lotr2/commit/1ba181b8a5dc6bf3ceb796646f58e722e2f8ef4f))
* **ui:** add option to have a bigger ground menu ([543f978](https://github.com/landoftherair/lotr2/commit/543f978b9d0b4fec77134a9e9fba185110c97fb9)), closes [#127](https://github.com/landoftherair/lotr2/issues/127)



