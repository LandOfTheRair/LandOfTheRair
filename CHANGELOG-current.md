# [2.6.0](https://github.com/landoftherair/landoftherair/compare/v2.5.1...v2.6.0) (2024-09-30)


### Bug Fixes

* **account:** when making an account, premium ref needs to have more info ([df3c22a](https://github.com/landoftherair/landoftherair/commit/df3c22a0640fbaf9e2dbd701dc49629d3b6c2456))
* **ai:** agro-related tweaks to make natural resources reset their agro every tick, pet targetting improvements ([2a5469f](https://github.com/landoftherair/landoftherair/commit/2a5469f7fa3bcdfcaaeb83b6236720e545a9048d))
* **assets:** load assets when receiving a login response rather than when emitting it ([3c6a790](https://github.com/landoftherair/landoftherair/commit/3c6a79080a2801a9a24ab0e46ada5860824c3aec))
* **core:** fix weird movement error. closes [#429](https://github.com/landoftherair/landoftherair/issues/429) ([3230f30](https://github.com/landoftherair/landoftherair/commit/3230f303ee9bb8eef8365761f0e1740944005c88))
* **core:** forgot password should not send an email if there is no account ([70512de](https://github.com/landoftherair/landoftherair/commit/70512dede6a799a9fba4806bf7a67783dcf40f1f))
* **core:** players should have a default sub tier of 0 ([4eb62ed](https://github.com/landoftherair/landoftherair/commit/4eb62edd49e6a8d9b281d3a4c0345fb4a5498fc2))
* **core:** spells should flag skill gain ([0baf9d0](https://github.com/landoftherair/landoftherair/commit/0baf9d0e5256fe74b3484d38965903737372e920))
* **core:** targetting should now make more sense from a code logstics standpoint, and be more maintainable if it ever needs to change. ([1800350](https://github.com/landoftherair/landoftherair/commit/18003506a27c61dc063cc11f8dcf0c785f08403a))
* **effect:** handle unique effects whether or not there's code behind it ([c7391e5](https://github.com/landoftherair/landoftherair/commit/c7391e5c8099b0f563963835d8e727f18a38826a))
* **log:** adventure log will let you scroll back if there isn't any active incoming messages ([d4516a6](https://github.com/landoftherair/landoftherair/commit/d4516a65b9c45432461eaa84c0c4c5c130274f85))
* **logs:** log crash context when getting override info for a spell. closes [#436](https://github.com/landoftherair/landoftherair/issues/436) ([ded07a6](https://github.com/landoftherair/landoftherair/commit/ded07a65c3aadc44410aded33d62a2bda9ae02fb))
* **pet:** pets will now target correctly with aoes ([8b8004c](https://github.com/landoftherair/landoftherair/commit/8b8004c909c7275390853998dde8c4638e5cf42c))
* **player:** players will remove invalid effects on login ([4f368b1](https://github.com/landoftherair/landoftherair/commit/4f368b1bebda6e5a1bf35b40f44b79e542c4e8b6))
* **song:** hard-cap songs to 12 aoe targets, like everything else ([88be645](https://github.com/landoftherair/landoftherair/commit/88be645dd4a48739f05ff98445053b6879892785))
* **spell:** bar* spells will now properly use the casters barrier trait levels ([323edb4](https://github.com/landoftherair/landoftherair/commit/323edb4245fb21a4241c2bcb3d4260a57c88ef16))
* **spell:** lots of tooltip fixes ([88ed99f](https://github.com/landoftherair/landoftherair/commit/88ed99f54b1f460ed7f1e2ddb9e190cb346c1952))
* **spell:** remove useless code for snare ([26a3227](https://github.com/landoftherair/landoftherair/commit/26a322725ba59b8b65f9227c8ab31e3dfafc101b))
* **spell:** shadow clones are handled more consistently with other summons ([899dff5](https://github.com/landoftherair/landoftherair/commit/899dff5fa019ea8ac773eec9416b497cacee6365))
* **spell:** songs will now give a 10s buff rather than 5, to help prevent lapses ([e816f56](https://github.com/landoftherair/landoftherair/commit/e816f567a82eeebae18c2f15802ec65246e986bb))
* **ui:** FOUT-adjacent fix for macro bar ([88a3247](https://github.com/landoftherair/landoftherair/commit/88a32473f0109d3191e32bc15b52c519ef8aa348))


### Features

* **content:** support challenge->statsByLevel for further tweaking of the curve ([83f98a0](https://github.com/landoftherair/landoftherair/commit/83f98a077109386f8d6438fcb3a92283b764ca84))
* **core:** improve some stat descs ([8d54546](https://github.com/landoftherair/landoftherair/commit/8d5454662bb0a8b43205f612fbf4b1833b78ebc6))
* **gm:** takeover logging now makes actual sense ([65278cb](https://github.com/landoftherair/landoftherair/commit/65278cbb76e0b062c5adefbad12ef2b3ecc4d396))
* **npc:** new challenge data to slightly adjust stats ([f3cf164](https://github.com/landoftherair/landoftherair/commit/f3cf164bb01f789cbf1368d650612094e16cb2a8))
* **npc:** npcs now hit more against lower level players ([ff0acfb](https://github.com/landoftherair/landoftherair/commit/ff0acfb2f6372d3f3443292193eb87e647d1d041))
* **options:** can now export window positions and import them ([3931990](https://github.com/landoftherair/landoftherair/commit/3931990815e48088a78c8ef3e5888aeb5b556360))
* **pet:** add new pettarget command. can reset agro or force targetting something specific ([766c35e](https://github.com/landoftherair/landoftherair/commit/766c35e21bfd2c5da59fd3f68c52875da5e2ab3b))
* **px:** add $pet for pet targetting ([28f05d9](https://github.com/landoftherair/landoftherair/commit/28f05d982f396c6b091ceee750a96b80f240e3e2))
* **spell:** FF spell will look nicer now ([654722e](https://github.com/landoftherair/landoftherair/commit/654722e52bbb740c460659f6e9977b98dd5612ea))
* **spell:** provoke will force retarget players ([46cde3a](https://github.com/landoftherair/landoftherair/commit/46cde3ab8cdd4788888536fd0b845c7c8baec7bf))
* **takeover:** takeover more messages for better debugging ([6c7d8fc](https://github.com/landoftherair/landoftherair/commit/6c7d8fc7409c80eaa2607758e6b3bbc51809e31c))
* **targetting:** $targets that target npcs will only target hostile ones now ([6a47472](https://github.com/landoftherair/landoftherair/commit/6a4747293b8409e678a8d912f612594bbee18d66))
* **ui:** can now hold window bar + arrow keys for precise window movement ([30f64a4](https://github.com/landoftherair/landoftherair/commit/30f64a427703d4bf3b3c713313498f797e98c13e))



